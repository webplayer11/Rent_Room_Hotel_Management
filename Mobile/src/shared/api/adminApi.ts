import { apiFetch } from "./apiClient";

export type ApiResponse<T> = {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
};

export type PendingHostDto = {

  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  taxCode: string;
  companyName: String;
  businessLicenseUrls: string[];
};

export type PendingHotelDto = {
  id: string;
  name: string;
  address: string;
  description: string;
  starRating: number;
  checkInTime: string;
  checkOutTime: string;
  createdAt: string;
  images: any[];
};


export const adminApi = {
  getPendingHosts: () => {
    return apiFetch('/api/admin/hosts/pending', {
      method: "GET",
    }) as Promise<ApiResponse<PendingHostDto[]>>;
  },

  getPendingHostDetail: (id: string) => {
    return apiFetch(`/api/admin/hosts/${id}`, {
      method: "GET",
    }) as Promise<ApiResponse<PendingHostDto>>;
  },


  Reject: (id: string, reason: string) => {
    return apiFetch(`/api/admin/hosts/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }) as Promise<ApiResponse<string>>;
  },

  Approved: (id: string) => {
    return apiFetch(`/api/admin/hosts/${id}/approve`, {
      method: "POST",
    }) as Promise<ApiResponse<PendingHostDto>>;
  },


  getPendingHotel: () => {
    return apiFetch('/api/admin/hotels/pending', {
      method: "GET",
    }) as Promise<ApiResponse<PendingHotelDto[]>>;
  },


  getPendingHotelDetail: (id: string) => {
    return apiFetch(`/api/admin/hotels/${id}`, {
      method: "GET",
    }) as Promise<ApiResponse<PendingHotelDto>>;
  },

  ApproveHotel: (id: string) => {
    return apiFetch(`/api/admin/hotels/${id}/approve`, {
      method: "POST",
    }) as Promise<ApiResponse<PendingHotelDto>>;
  },

  RejectHotel: (id: string) => {
    return apiFetch(`/api/admin/hotels/${id}`, {
      method: "DELETE",
    }) as Promise<ApiResponse<string>>;
  },
};