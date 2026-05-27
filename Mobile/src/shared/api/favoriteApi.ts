import { apiFetch } from './apiClient';
import { ApiResponse } from './hotelApi';

export type FavoriteStatusDto = {
  isFavorited: boolean;
};

export type FavoriteHotelDto = {
  id: string;
  name?: string;
  address?: string;
  images?: { url?: string; isPrimary?: boolean }[];
  starRating?: number;
  latitude?: number;
  longitude?: number;
  isApproved?: boolean;
  availableRooms?: { pricePerNight: number }[];
};

export const favoriteApi = {
  /** Toggle thêm/xóa khách sạn khỏi danh sách yêu thích */
  toggleFavorite: (hotelId: string) => {
    return apiFetch(`/api/favorites/${hotelId}`, {
      method: 'POST',
    }) as Promise<ApiResponse<FavoriteStatusDto>>;
  },

  /** Lấy danh sách khách sạn yêu thích của user */
  getMyFavorites: () => {
    return apiFetch('/api/favorites', {
      method: 'GET',
    }) as Promise<ApiResponse<FavoriteHotelDto[]>>;
  },

  /** Kiểm tra 1 khách sạn có trong yêu thích không */
  checkFavoriteStatus: (hotelId: string) => {
    return apiFetch(`/api/favorites/${hotelId}/status`, {
      method: 'GET',
    }) as Promise<ApiResponse<FavoriteStatusDto>>;
  },
};
