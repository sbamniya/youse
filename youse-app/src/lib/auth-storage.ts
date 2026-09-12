// auth-storage.ts
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const authStorage = {
  setAccessToken: async (token: string) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  getAccessToken: async () => {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  setRefreshToken: async (token: string) => {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  getRefreshToken: async () => {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  clear: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};