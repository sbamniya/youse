import { AxiosRequestConfig, create } from "axios";
import { authStorage } from "./auth-storage";

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
    "Content-Type": "application/json"
  },
});

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
      }
    });
    return response.data;
  },
  async post<
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
    const response = await axiosInstance.post<Response>(url, config, {
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
    config?: {
      data?: AxiosRequestConfig<Data>["data"];
      params?: AxiosRequestConfig<Params>["params"];
    },
  ) {
    const response = await axiosInstance.patch<Response>(url, config, {
      headers: {
        Authorization: await getAuthToken(),
      },
    });
    return response.data;
  },
  async put<Response, Data = Record<string, any>, Params = Record<string, any>>(
    url: string,
    config?: {
      data?: AxiosRequestConfig<Data>["data"];
      params?: AxiosRequestConfig<Params>["params"];
    },
  ) {
    const response = await axiosInstance.put<Response>(url, config, {
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
