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
  // trạng thái từ backend (Hotel.cs)
  isApproved: boolean;
  isActive: boolean;
  suspendedAt?: string;
  suspendReason?: string;
};

export type AdminUserDto = {
  id: string;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
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

  getAllHotels: () => {
    return apiFetch('/api/admin/hotels', {
      method: "GET",
    }) as Promise<ApiResponse<PendingHotelDto[]>>;
  },

  getPendingHotel: () => {
    return apiFetch('/api/admin/hotels/pending', {
      method: "GET",
    }) as Promise<ApiResponse<PendingHotelDto[]>>;
  },

  getApprovedHotels: () => {
    return apiFetch('/api/admin/hotels/approved', {
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

  SuspendHotel: (id: string, reason: string) => {
    return apiFetch(`/api/admin/hotels/${id}/suspend`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }) as Promise<ApiResponse<string>>;
  },

  UnsuspendHotel: (id: string) => {
    return apiFetch(`/api/admin/hotels/${id}/unsuspend`, {
      method: "POST",
    }) as Promise<ApiResponse<string>>;
  },

  DeleteHotel: (id: string) => {
    return apiFetch(`/api/admin/hotels/${id}`, {
      method: "DELETE",
    }) as Promise<ApiResponse<string>>;
  },

  // ── User Management ──────────────────────────────────────────
  getAllUsers: () => {
    return apiFetch('/api/admin/users', {
      method: "GET",
    }) as Promise<ApiResponse<AdminUserDto[]>>;
  },

  getUserById: (id: string) => {
    return apiFetch(`/api/admin/users/${id}`, {
      method: "GET",
    }) as Promise<ApiResponse<AdminUserDto>>;
  },

  lockUser: (id: string) => {
    return apiFetch(`/api/admin/users/${id}/lock`, {
      method: "POST",
    }) as Promise<ApiResponse<string>>;
  },

  unlockUser: (id: string) => {
    return apiFetch(`/api/admin/users/${id}/unlock`, {
      method: "POST",
    }) as Promise<ApiResponse<string>>;
  },
};



