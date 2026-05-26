import { apiFetch } from './apiClient';
import { ApiResponse } from './hotelApi';

export type BookingDto = {
  id: string;
  userId: string;
  roomId: string;
  hotelId?: string;
  hotelName?: string;
  roomName?: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string; // 'Pending' | 'Confirmed' | 'CheckedIn' | 'CheckedOut' | 'Cancelled' | 'Rejected'
  voucherCode?: string;
  discountAmount?: number;
  createdAt?: string;
  guestCount?: number;
  roomCount?: number;
  note?: string;
};

export type CreateBookingDto = {
  roomId: string;
  checkInDate: string;   // 'YYYY-MM-DD'
  checkOutDate: string;  // 'YYYY-MM-DD'
  guestCount: number;
  roomCount?: number;
  voucherCode?: string;
  note?: string;
};

export type UpdateBookingStatusDto = {
  status: string;
  note?: string;
};

export const bookingApi = {
  /** Tạo đơn đặt phòng */
  createBooking: (dto: CreateBookingDto) => {
    return apiFetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(dto),
    }) as Promise<ApiResponse<BookingDto>>;
  },

  /** Lấy danh sách đơn đặt của khách hàng đang đăng nhập */
  getMyBookings: () => {
    return apiFetch('/api/bookings/my-bookings', {
      method: 'GET',
    }) as Promise<ApiResponse<BookingDto[]>>;
  },

  /** Lấy danh sách đơn đặt của host (tất cả khách sạn) */
  getHostBookings: () => {
    return apiFetch('/api/bookings/host-bookings', {
      method: 'GET',
    }) as Promise<ApiResponse<BookingDto[]>>;
  },

  /** Lấy chi tiết 1 đơn theo ID */
  getBookingById: (id: string) => {
    return apiFetch(`/api/bookings/${id}`, {
      method: 'GET',
    }) as Promise<ApiResponse<BookingDto>>;
  },

  /** Host cập nhật trạng thái đơn (Confirmed/Rejected/CheckedIn/CheckedOut) */
  updateBookingStatus: (id: string, dto: UpdateBookingStatusDto) => {
    return apiFetch(`/api/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }) as Promise<ApiResponse<BookingDto>>;
  },
};
