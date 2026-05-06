export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phone?: string;
}

export interface BookingPriceDetail {
  basePricePerNight: number;
  nights: number;
  roomCount: number;
  totalBasePrice: number;
  discountAmount: number;
  voucherDiscountAmount: number;
  taxAmount: number;
  serviceFee: number;
  finalPrice: number;
}

export interface BookingSummaryPayload {
  hotelId: string | number;
  roomId: string | number;
  hotelName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  userInfo: UserInfo;
  priceDetail: BookingPriceDetail;
}
