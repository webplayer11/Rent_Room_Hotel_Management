export interface RoomVoucher {
  id: string;
  code: string;
  title: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minPrice: number;
}

export interface Room {
  id: string | number;
  hotelId: string | number;
  name: string;
  area: string;
  images: string[];
  maxAdults: number;
  maxChildren: number;
  bedInfo: string;
  amenities: string[];
  policies: string[];
  availableRooms: number;
  badges: string[];
  basePrice: number;
  oldPrice: number;
  discountPercent: number;
  voucher?: RoomVoucher;
  breakfastFee: number;
  serviceFee: number;
  taxFee: number;
  refundable: boolean;
  payAtHotel: boolean;
  noCreditCardRequired: boolean;
  recommended?: boolean;
  lowestPrice?: boolean;
}

export interface RoomPriceSummary {
  totalBasePrice: number;
  discountAmount: number;
  priceAfterDiscount: number;
  voucherDiscountAmount: number;
  serviceFee: number;
  taxFee: number;
  finalPrice: number;
}

export interface RoomSearchParams {
  hotelId: string | number;
  checkIn: string;
  checkOut: string;
  rooms: string;
  adults: string;
  children: string;
  childAges: number[];
}

export interface SelectedRoomPayload {
  roomId: string | number;
  hotelId: string | number;
  selectedRoomCount: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  finalPrice: number;
}
