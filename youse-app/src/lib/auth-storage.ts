import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { AuthUser } from "./auth-user";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

async function setItem(key: string, value: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string) {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string) {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export const authStorage = {
  setAccessToken: (token: string) => setItem(ACCESS_TOKEN_KEY, token),

  getAccessToken: () => getItem(ACCESS_TOKEN_KEY),

  setRefreshToken: (token: string) => setItem(REFRESH_TOKEN_KEY, token),

  getRefreshToken: () => getItem(REFRESH_TOKEN_KEY),

  clear: async () => {
    await Promise.all([
      removeItem(ACCESS_TOKEN_KEY),
      removeItem(REFRESH_TOKEN_KEY),
      removeItem(USER_KEY),
    ]);
  },
  setUser: (user: AuthUser) => setItem(USER_KEY, JSON.stringify(user)),
  getUser: () =>
    getItem(USER_KEY).then((user): AuthUser | null =>
      user ? JSON.parse(user) : null,
    ),
};
