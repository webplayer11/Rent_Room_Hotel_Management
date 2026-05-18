import { apiFetch } from "./apiClient";
import { Platform } from "react-native";

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

  upgradeToHost: async (
  companyName: string,
  taxCode: string,
  businessLicenses: any[]
) => {
  const formData = new FormData();

  formData.append("CompanyName", companyName);
  formData.append("TaxCode", taxCode);

  for (let index = 0; index < businessLicenses.length; index++) {
    const file = businessLicenses[index];

    const fileName =
      file.fileName ||
      file.name ||
      `license_${index}.jpg`;

    const fileType =
      file.mimeType ||
      file.type ||
      "image/jpeg";

    // WEB
    if (Platform.OS === "web") {
      const response = await fetch(file.uri);
      const blob = await response.blob();

      formData.append(
        "BusinessLicenses",
        blob,
        fileName
      );
    }

    // MOBILE
    else {
      formData.append("BusinessLicenses", {
        uri: file.uri,
        name: fileName,
        type: fileType,
      } as any);
    }
  }

  return apiFetch("/api/auth/upgrade-to-host", {
    method: "POST",
    body: formData,
    isFormData: true,
  }) as Promise<ApiResponse<string>>;
},
};