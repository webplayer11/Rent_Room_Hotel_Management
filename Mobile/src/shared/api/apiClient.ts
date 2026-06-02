import { tokenStorage } from "../storage/tokenStorage";

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();

export type ApiResponse<T> = {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
};

type AuthResponseDto = {
  fullName: string;
  roles: string[];
  token: string;
  refreshToken: string;
};

type ApiFetchOptions = RequestInit & {
  isFormData?: boolean;
};

async function refreshAccessToken(): Promise<string> {
  const accessToken = await tokenStorage.getAccessToken();
  const refreshToken = await tokenStorage.getRefreshToken();

  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is missing");
  }

  if (!accessToken || !refreshToken) {
    throw new Error("Missing access token or refresh token");
  }

  const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accessToken,
      refreshToken,
    }),
  });

  const result = await response.json().catch(() => null);

  console.log("REFRESH STATUS:", response.status);
  console.log("REFRESH RESPONSE:", result);

  if (!response.ok) {
    throw new Error(result?.message || "Refresh token failed");
  }

  const token = result?.data?.token;
  const newRefreshToken = result?.data?.refreshToken;

  if (!token || !newRefreshToken) {
    throw new Error("Invalid refresh token response");
  }

  await tokenStorage.saveTokens(
    token,
    newRefreshToken,
    result?.data?.roles?.[0] ?? ""
  );

  return token;
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error(
      "EXPO_PUBLIC_API_URL is not configured. Check your .env file."
    );
  }

  const accessToken = await tokenStorage.getAccessToken();

  const buildHeaders = (token?: string): HeadersInit => {
    const headers: Record<string, string> = {};

    if (!options.isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return {
      ...headers,
      ...(options.headers as Record<string, string>),
    };
  };

  const makeRequest = async (token?: string) => {
    const url = `${API_URL}${endpoint}`;

    console.log("REQUEST URL:", url);
    console.log("METHOD:", options.method || "GET");
    console.log("TOKEN EXISTS:", !!token);

    return fetch(url, {
      ...options,
      headers: buildHeaders(token),
    });
  };

  try {
    let response = await makeRequest(accessToken || undefined);

    const isAuthEndpoint =
      endpoint.includes("/api/auth/login") ||
      endpoint.includes("/api/auth/register") ||
      endpoint.includes("/api/auth/forgot-password") ||
      endpoint.includes("/api/auth/reset-password") ||
      endpoint.includes("/api/auth/refresh-token");

    if (response.status === 401 && !isAuthEndpoint) {
      console.log("401 detected, refreshing token...");

      try {
        const newToken = await refreshAccessToken();
        response = await makeRequest(newToken);
      } catch (error) {
        await tokenStorage.clearTokens();
        throw new Error(
          "Session expired. Please login again."
        );
      }
    }

    const data = await response.json().catch(() => null);

    console.log("RESPONSE STATUS:", response.status);
    console.log("RESPONSE DATA:", data);

    if (!response.ok) {
      const errorMessage =
        data?.data?.join?.("\n") ||
        data?.errors?.join?.("\n") ||
        data?.message ||
        `API Error ${response.status}`;

      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error) {
    console.log("apiFetch failed:", error instanceof Error ? error.message : error);
    throw error;
  }
}