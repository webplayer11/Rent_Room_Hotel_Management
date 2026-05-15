import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refresh_token";
const ROLE_KEY = "role";

const isWeb = Platform.OS === "web";

export const tokenStorage = {
  saveTokens: async (token: string, refreshToken?: string, role?: string) => {
    if (isWeb) {
      localStorage.setItem(TOKEN_KEY, token);
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      if (role) localStorage.setItem(ROLE_KEY, role);
      return;
    }

    await SecureStore.setItemAsync(TOKEN_KEY, token);
    if (refreshToken) await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    if (role) await SecureStore.setItemAsync(ROLE_KEY, role);
  },

  getAccessToken: async () => {
    if (isWeb) return localStorage.getItem(TOKEN_KEY);
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  getRefreshToken: async () => {
    if (isWeb) return localStorage.getItem(REFRESH_TOKEN_KEY);
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  getRole: async () => {
    if (isWeb) return localStorage.getItem(ROLE_KEY);
    return await SecureStore.getItemAsync(ROLE_KEY);
  },

  clearTokens: async () => {
    if (isWeb) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
      return;
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(ROLE_KEY);
  },
};