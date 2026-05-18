import { apiFetch } from "./apiClient";

export type ApiResponse<T> = {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
};

export type PendingHostDto = {
 
  id: string;
  fullName:string;
  email: string;
  phoneNumber: string;
  createdAt: string; 
  taxCode: string;
  companyName: String;
  businessLicenseUrls: string[];
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


  Reject: (id: string, reason:string) => {
    return apiFetch(`/api/admin/hosts/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({reason}),
    }) as Promise<ApiResponse<string>>;
  },

  Approved: (id: string) => {
    return apiFetch(`/api/admin/hosts/${id}/approve`, {
      method: "POST",
    }) as Promise<ApiResponse<PendingHostDto>>;
  },



};