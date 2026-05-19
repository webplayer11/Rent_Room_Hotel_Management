import { tokenStorage } from "../storage/tokenStorage";

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();

type ApiResponse<T> = {
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

async function refreshAccessToken() {
  const accessToken = await tokenStorage.getAccessToken();
  const refreshToken = await tokenStorage.getRefreshToken();

  if (!API_URL) {
    throw new Error("Thiếu EXPO_PUBLIC_API_URL trong file .env");
  }

  if (!accessToken || !refreshToken) {
    throw new Error("Không có token để làm mới");
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

  const result = (await response.json().catch(() => null)) as ApiResponse<AuthResponseDto> | null;

  if (!response.ok || !result?.data?.token) {
    throw new Error(result?.message || "Refresh token thất bại");
  }

  await tokenStorage.saveTokens(
    result.data.token,
    result.data.refreshToken,
    result.data.roles?.[0]
  );

  return result.data.token;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error("Thiếu EXPO_PUBLIC_API_URL trong file .env");
  }

  const accessToken = await tokenStorage.getAccessToken();

  const buildHeaders = (token?: string) => {
    const headers: Record<string, string> = {};

    if (!options.isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return {
      ...headers,
      ...(options.headers as Record<string, string>),
    };
  };

  console.log("API URL:", `${API_URL}${endpoint}`);
  console.log("ACCESS TOKEN:", accessToken);

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(accessToken || undefined),
  });

  const isAuthEndpoint =
    endpoint.includes("/api/auth/login") ||
    endpoint.includes("/api/auth/register") ||
    endpoint.includes("/api/auth/forgot-password") ||
    endpoint.includes("/api/auth/reset-password") ||
    endpoint.includes("/api/auth/refresh-token");

  if (response.status === 401 && !isAuthEndpoint) {
    try {
      const newToken = await refreshAccessToken();

      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: buildHeaders(newToken),
      });
    } catch {
      await tokenStorage.clearTokens();
      throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.log("API ERROR STATUS:", response.status);
    console.log("API ERROR DATA:", data);

    const errorMessage =
      data?.data?.join?.("\n") ||
      data?.errors?.join?.("\n") ||
      data?.message ||
      `API lỗi ${response.status}`;

    throw new Error(errorMessage);
  }

  return data;
}