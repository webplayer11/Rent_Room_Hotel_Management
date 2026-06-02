import { apiFetch } from './apiClient';
import { ApiResponse } from './hotelApi';

export type HostProfileDto = {
  id: string;
  userId: string;
  fullName?: string;
  phone?: string;
  email?: string;
  companyName?: string;
  taxId?: string;
  businessAddress?: string;
  avatarUrl?: string;
  isVerified?: boolean;
};

export type UpdateHostProfileDto = {
  fullName?: string;
  phone?: string;
  companyName?: string;
  taxId?: string;
  businessAddress?: string;
};

export type RevenueByTimeDto = {
  period: string;
  revenue: number;
};

export type HostRevenueItemDto = {
  hotelId: string;
  hotelName?: string;
  revenue: number;
  commission: number;
  netRevenue: number;
  bookingCount: number;
};

export type HostRevenueDto = {
  totalRevenue: number;
  commissionRate: number;
  commissionAmount: number;
  netRevenue: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  byYear: RevenueByTimeDto[];
  byMonth: RevenueByTimeDto[];
  byHotel: HostRevenueItemDto[];
};

export type HotelRevenueDetailDto = {
  hotelId: string;
  hotelName?: string;
  totalRevenue: number;
  commission: number;
  netRevenue: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  byYear: RevenueByTimeDto[];
  byMonth: RevenueByTimeDto[];
};

export const hostApi = {
  /** Lấy hồ sơ host đang đăng nhập */
  getMyProfile: () => {
    return apiFetch('/api/hosts/me', {
      method: 'GET',
    }) as Promise<ApiResponse<HostProfileDto>>;
  },

  /** Cập nhật hồ sơ host */
  updateMyProfile: (dto: UpdateHostProfileDto) => {
    return apiFetch('/api/hosts/me', {
      method: 'PUT',
      body: JSON.stringify(dto),
    }) as Promise<ApiResponse<HostProfileDto>>;
  },

  /** Lấy tổng doanh thu tất cả khách sạn của host */
  getMyRevenue: () => {
    return apiFetch('/api/hosts/revenue', {
      method: 'GET',
    }) as Promise<ApiResponse<HostRevenueDto>>;
  },

  /** Lấy doanh thu theo từng khách sạn */
  getHotelRevenue: (hotelId: string) => {
    return apiFetch(`/api/hosts/revenue/${hotelId}`, {
      method: 'GET',
    }) as Promise<ApiResponse<HotelRevenueDetailDto>>;
  },
};
