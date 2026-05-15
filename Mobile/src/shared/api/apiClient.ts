import { tokenStorage } from "../storage/tokenStorage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

async function refreshAccessToken() {
  const accessToken = await tokenStorage.getAccessToken();
  const refreshToken = await tokenStorage.getRefreshToken();

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

  const result = (await response.json()) as ApiResponse<AuthResponseDto>;

  if (!response.ok || !result.data) {
    throw new Error(result.message || "Refresh token thất bại");
  }

  await tokenStorage.saveTokens(
    result.data.token,
    result.data.refreshToken
  );

  return result.data.token;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error("Thiếu EXPO_PUBLIC_API_URL trong file .env");
  }

  const accessToken = await tokenStorage.getAccessToken();

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 && !endpoint.includes("login")) {
    try {
      const newToken = await refreshAccessToken();

      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`,
          ...(options.headers || {}),
        },
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
    "Có lỗi xảy ra";

  throw new Error(errorMessage);
}

  return data;
}