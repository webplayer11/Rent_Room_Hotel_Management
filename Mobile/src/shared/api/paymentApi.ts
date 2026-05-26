import { apiFetch } from './apiClient';
import { ApiResponse } from './hotelApi';

export type PaymentDto = {
  id: string;
  bookingId: string;
  amount: number;
  method?: string;
  status?: string; // 'Pending' | 'Paid' | 'Failed' | 'Refunded'
  transactionId?: string;
  paidAt?: string;
  createdAt?: string;
};

export type ProcessPaymentRequestDto = {
  bookingId: string;
  method: string; // 'Cash' | 'BankTransfer' | 'Card'
  transactionId?: string;
};

export type PaymentRequestDto = {
  idBooking: string;
  price: number;
};

export type PaymentResponseDto = {
  qrUrl?: string;
  payUrl?: string;
  transactionId?: string;
};

export const paymentApi = {
  /** Xử lý thanh toán thủ công (cash/bank) */
  processPayment: (dto: ProcessPaymentRequestDto) => {
    return apiFetch('/api/payments/process', {
      method: 'POST',
      body: JSON.stringify(dto),
    }) as Promise<ApiResponse<PaymentDto>>;
  },

  /** Lấy danh sách thanh toán theo booking */
  getPaymentsByBooking: (bookingId: string) => {
    return apiFetch(`/api/payments/booking/${bookingId}`, {
      method: 'GET',
    }) as Promise<ApiResponse<PaymentDto[]>>;
  },

  /** Tạo QR thanh toán online (gọi payment gateway) */
  createOnlinePayment: (dto: PaymentRequestDto) => {
    return apiFetch('/api/payments/createpayment', {
      method: 'POST',
      body: JSON.stringify(dto),
    }) as Promise<ApiResponse<PaymentResponseDto>>;
  },

  /** Kiểm tra trạng thái thanh toán của 1 booking */
  getPaymentStatus: (bookingId: string) => {
    return apiFetch(`/api/payments/${bookingId}/status`, {
      method: 'GET',
    }) as Promise<ApiResponse<string>>;
  },
};
