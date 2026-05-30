import { apiFetch} from "./apiClient";
import { ApiResponse } from './hotelApi';
export type ProfileDto = {
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
};

export const profileApi = {
  getProfile: () => {
    return apiFetch("/api/profile", {
      method: "GET",
    }) as Promise<ApiResponse<ProfileDto>>;
  },

  updateProfile: (data: {
    fullName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    address?: string;
  }) => {
    return apiFetch("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }) as Promise<ApiResponse<string>>;
  },
};