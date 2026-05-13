import { apiGet, apiPost } from '../../../shared/api/apiClient';

export type BackendHotelDto = {
  id: string;
  name?: string | null;
  address?: string | null;
  description?: string | null;
  isApproved?: boolean | null;
  ownerId?: string | null;
  images?: unknown[] | null;
  amenities?: unknown[] | null;
};

export type CreateHotelRequest = {
  id: string;
  name?: string;
  address?: string;
  description?: string;
  ownerId: string;
};

export const ownerHotelApi = {
  createHotel: (body: CreateHotelRequest) => {
    return apiPost<BackendHotelDto, CreateHotelRequest>('/hotel', body);
  },

  getHotelsByOwner: (ownerId: string) => {
    return apiGet<BackendHotelDto[]>(`/hotel/owner/${ownerId}`);
  },
};