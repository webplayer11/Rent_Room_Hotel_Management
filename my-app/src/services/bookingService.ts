import { BookingPriceDetail, UserInfo, BookingSummaryPayload } from '../types/booking';

export const bookingService = {
  calculateBookingPrice: (
    basePrice: number,
    nights: number,
    roomCount: number,
    discountPercent: number = 0,
    voucherValue: number = 0,
    voucherType: 'percent' | 'fixed' = 'fixed'
  ): BookingPriceDetail => {
    const totalBasePrice = basePrice * nights * roomCount;
    const discountAmount = totalBasePrice * (discountPercent / 100);
    const priceAfterDiscount = totalBasePrice - discountAmount;

    let voucherDiscountAmount = 0;
    if (voucherType === 'percent') {
      voucherDiscountAmount = priceAfterDiscount * (voucherValue / 100);
    } else {
      voucherDiscountAmount = voucherValue;
    }

    const taxAmount = 0;
    const serviceFee = 0;

    const finalPrice = Math.max(0, priceAfterDiscount - voucherDiscountAmount);

    return {
      basePricePerNight: basePrice,
      nights,
      roomCount,
      totalBasePrice,
      discountAmount,
      voucherDiscountAmount,
      taxAmount,
      serviceFee,
      finalPrice,
    };
  },

  validateBooking: (info: UserInfo): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    if (!info.firstName.trim()) errors.firstName = 'Vui lòng nhập tên';
    if (!info.lastName.trim()) errors.lastName = 'Vui lòng nhập họ';
    if (!info.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(info.email)) {
      errors.email = 'Email không hợp lệ';
    }
    if (!info.country.trim()) errors.country = 'Vui lòng chọn quốc gia';

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  },

  submitBooking: async (payload: BookingSummaryPayload): Promise<{ success: boolean; bookingId: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    return {
      success: true,
      bookingId: `BK${Math.floor(Math.random() * 1000000)}`,
    };
  },
};
