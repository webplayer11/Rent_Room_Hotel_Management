import { apiFetch } from "./apiClient";

export type VoucherDto = {
  id: string;
  code: string;
  type?: string;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  minNights?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  hotelId?: string;
  createdByUserId?: string;
};

export type CreateSystemVoucherDto = {
  code: string;
  type: "Percent" | "FixedAmount";
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
};

export type CreateHotelVoucherDto = CreateSystemVoucherDto & {
  hotelId: string;
  minNights?: number;
};

export type VoucherStatsDto = {
  id: string;
  code: string;
  usageLimit: number;
  usedCount: number;
  remainingUses: number;
  totalDiscountGiven: number;
};

export type ValidateVoucherDto = {
  code: string;
  isValid: boolean;
  message?: string;
  voucher?: VoucherDto;
};

export const voucherApi = {
  getSystemVouchers: () => {
    return apiFetch("/api/vouchers/system", {
      method: "GET",
    }) as Promise<{ isSuccess: boolean; message: string; data: VoucherDto[] }>;
  },

  createSystemVoucher: (dto: CreateSystemVoucherDto) => {
    return apiFetch("/api/vouchers/system", {
      method: "POST",
      body: JSON.stringify(dto),
    }) as Promise<{ isSuccess: boolean; message: string; data: VoucherDto }>;
  },

  deleteVoucher: (id: string) => {
    return apiFetch(`/api/vouchers/${id}`, {
      method: "DELETE",
    }) as Promise<{ isSuccess: boolean; message: string; data: any }>;
  },

  /** Lấy voucher theo khách sạn (public) */
  getHotelVouchers: (hotelId: string) => {
    return apiFetch(`/api/vouchers/hotel/${hotelId}`, {
      method: "GET",
    }) as Promise<{ isSuccess: boolean; message: string; data: VoucherDto[] }>;
  },

  /** Kiểm tra / validate mã voucher */
  validateVoucher: (code: string) => {
    return apiFetch(`/api/vouchers/validate/${code}`, {
      method: "GET",
    }) as Promise<{ isSuccess: boolean; message: string; data: ValidateVoucherDto }>;
  },
};

