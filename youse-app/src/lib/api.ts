import {
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  create,
  isAxiosError,
} from "axios";

import { authStorage } from "./auth-storage";
import type { AuthenticationResponse } from "./auth-user";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

class MissingRefreshTokenError extends Error {
  constructor() {
    super("A refresh token is required to restore the session.");
    this.name = "MissingRefreshTokenError";
  }
}

const getAuthToken = async () => {
  const token = await authStorage.getAccessToken();
  if (!token) {
    return undefined;
  }
  return `Bearer ${token}`;
};

const axiosInstance = create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL, // Replace with your API base URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<AuthenticationResponse> | null = null;

async function refreshSession() {
  const refreshToken = await authStorage.getRefreshToken();
  if (!refreshToken) {
    throw new MissingRefreshTokenError();
  }

  const response = await axiosInstance.post<AuthenticationResponse>(
    "/auth/refresh",
    { refreshToken },
  );

  await Promise.all([
    authStorage.setAccessToken(response.data.accessToken),
    authStorage.setRefreshToken(response.data.refreshToken),
    authStorage.setUser(response.data.user),
  ]);

  return response.data;
}

function getOrCreateRefreshRequest() {
  if (!refreshPromise) {
    refreshPromise = refreshSession().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error) || error.response?.status !== 401 || !error.config) {
      return Promise.reject(error);
    }

    const request = error.config as RetryableRequestConfig;
    const requestAuthorization = request.headers.get("Authorization");
    const isRefreshRequest = request.url?.endsWith("/auth/refresh");

    if (request._retry || isRefreshRequest || !requestAuthorization) {
      return Promise.reject(error);
    }

    request._retry = true;

    try {
      const storedAccessToken = await authStorage.getAccessToken();
      const storedAuthorization = storedAccessToken
        ? `Bearer ${storedAccessToken}`
        : undefined;

      // A slower request may return 401 after another request has already
      // refreshed the token. Retry it with the current token without refreshing
      // for a second time.
      const accessToken =
        storedAccessToken && requestAuthorization !== storedAuthorization
          ? storedAccessToken
          : (await getOrCreateRefreshRequest()).accessToken;

      request.headers.set("Authorization", `Bearer ${accessToken}`);
      return axiosInstance(request);
    } catch (refreshError) {
      const refreshWasRejected =
        refreshError instanceof MissingRefreshTokenError ||
        (isAxiosError(refreshError) &&
          [400, 401].includes(refreshError.response?.status ?? 0));

      if (refreshWasRejected) {
        await authStorage.clear();
        return Promise.reject(error);
      }

      return Promise.reject(refreshError);
    }
  },
);

const api = {
  getInstance: () => axiosInstance,
  async get<Response, Params = Record<string, any>>(
    url: string,
    params?: AxiosRequestConfig<Params>["params"],
  ) {
    const response = await axiosInstance.get<Response>(url, {
      params,
      headers: {
        Authorization: await getAuthToken(),
      },
    });
    return response.data;
  },
  async post<
    Response,
    Data = Record<string, any>,
    Params = Record<string, any>,
  >(
    url: string,
    data?: AxiosRequestConfig<Data>["data"],
    params?: AxiosRequestConfig<Params>["params"],
  ) {
    const response = await axiosInstance.post<Response>(url, data, {
      params,
      headers: {
        Authorization: await getAuthToken(),
      },
    });
    return response.data;
  },
  async patch<
    Response,
    Data = Record<string, any>,
    Params = Record<string, any>,
  >(
    url: string,
    data?: AxiosRequestConfig<Data>["data"],
    params?: AxiosRequestConfig<Params>["params"],
  ) {
    const response = await axiosInstance.patch<Response>(url, data, {
      params,
      headers: {
        Authorization: await getAuthToken(),
      },
    });
    return response.data;
  },
  async put<Response, Data = Record<string, any>, Params = Record<string, any>>(
    url: string,
    data?: AxiosRequestConfig<Data>["data"],
    params?: AxiosRequestConfig<Params>["params"],
  ) {
    const response = await axiosInstance.put<Response>(url, data, {
      params,
      headers: {
        Authorization: await getAuthToken(),
      },
    });
    return response.data;
  },
  async delete<
    Response,
    Data = Record<string, any>,
    Params = Record<string, any>,
  >(
    url: string,
    config?: {
      data?: AxiosRequestConfig<Data>["data"];
      params?: AxiosRequestConfig<Params>["params"];
    },
  ) {
    const response = await axiosInstance.delete<Response>(url, {
      ...config,
      headers: {
        Authorization: await getAuthToken(),
      },
    });
    return response.data;
  },
};

export default api;
