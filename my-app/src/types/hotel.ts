export interface Voucher {
  id: string;
  code: string;
  title: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minPrice: number;
}

export interface HotelReview {
  id: string;
  content: string;
  userName: string;
  country: string;
  rating: number;
  date: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  distance: string;
  type: 'landmark' | 'transport' | 'important' | 'restaurant';
}

export interface UsefulInfo {
  checkInFrom: string;
  checkOutUntil: string;
  receptionOpenUntil: string;
  distanceFromCityCenter: string;
  airportTransferTime: string;
  airportTransferFee: number;
  dailyInternetFee: number;
  breakfastFee: number;
}

export interface HotelPolicy {
  title: string;
  content: string;
}

export interface HotelDetail extends HotelSearchResult {
  description: string;
  images: string[];
  ratingText: string;
  highlights: string[];
  topAmenities: string[];
  reviews: HotelReview[];
  locationScore: number;
  nearbyPlaces: NearbyPlace[];
  usefulInfo: UsefulInfo;
  languages: string[];
  policies: HotelPolicy[];
}

export interface HotelSearchResult {
  id: string | number;
  name: string;
  address: string;
  image: string;
  rating: number;
  reviewCount: number;
  star: number;
  basePrice: number;
  discountPercent: number;
  availableRooms: number;
  amenities: string[];
  badges?: string[];
  voucher?: Voucher;
  lat: number;
  lng: number;
  type: string;
  distance?: number;
}

export interface HotelSearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  rooms: string;
  adults: string;
  children: string;
  childAges: number[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}

export interface HotelPriceSummary {
  totalBasePrice: number;
  priceAfterHotelDiscount: number;
  voucherDiscountAmount: number;
  finalPrice: number;
  nights: number;
}
