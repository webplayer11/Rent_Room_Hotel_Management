import { apiFetch } from "./apiClient";

export type ApiResponse<T> = {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
};

export type AuthResponseDto = {
  fullName: string;
  roles: string[];
  token: string;
  refreshToken: string;
};

export const authApi = {
  login: (data: { email: string; password: string }) => {
    return apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }) as Promise<ApiResponse<AuthResponseDto>>;
  },

register: (data: {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
}) => {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
},

  forgotPassword: (email: string) => {
  return apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  }) as Promise<
    ApiResponse<{
      resetToken: string;
    }>
  >;
},

resetPassword: (
  email: string,
  token: string,
  newPassword: string
) => {
  return apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      email,
      token,
      newPassword,
    }),
  }) as Promise<ApiResponse<string>>;
},
  refreshToken: (accessToken: string, refreshToken: string) => {
    return apiFetch("/api/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({
        accessToken,
        refreshToken,
      }),
    }) as Promise<ApiResponse<AuthResponseDto>>;
  },
};