export type HotelStatus = 'approved' | 'pending' | 'need_update';

export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'cancelled';

export type AlertAction =
  | 'pending_bookings'
  | 'new_reviews'
  | 'update_hotel_docs';

export type OwnerHotel = {
  id: string;
  name: string;
  address: string;
  roomCount: number;
  status: HotelStatus;
  rating?: number;
  monthlyBookings?: number;
};

export type OwnerBooking = {
  id: string;
  customerName: string;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  totalAmount: string;
  status: BookingStatus;
};

export type OwnerAlert = {
  id: string;
  message: string;
  type: 'warning' | 'info' | 'danger';
  action: AlertAction;
};

export type RevenuePoint = {
  label: string;
  value: number;
};

export type OwnerDashboardStats = {
  totalHotels: number;
  totalBookings: number;
  monthlyRevenue: string;
  pendingHotelApprovals: number;
  pendingBookingConfirmations: number;
};

export type OwnerDashboardData = {
  ownerName: string;
  companyName: string;
  unreadNotifications: number;
  stats: OwnerDashboardStats;
  hotels: OwnerHotel[];
  recentBookings: OwnerBooking[];
  alerts: OwnerAlert[];
  revenue7Days: RevenuePoint[];
};

// ---------------------------------------------------------------------------
// Hotel Form types
// ---------------------------------------------------------------------------

export type HotelAmenity = {
  id: string;
  label: string;
};

export type HotelImageUpload = {
  id: string;
  fileName: string;
};

export type HotelLegalDocument = {
  id: string;
  label: string;
  fileName: string | null;
};

export type HotelFormData = {
  name: string;
  street: string;
  district: string;
  city: string;
  phone: string;
  email: string;
  description: string;
  coverImage: HotelImageUpload | null;
  galleryImages: HotelImageUpload[];
  selectedAmenities: string[];
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  houseRules: string;
  legalDocuments: HotelLegalDocument[];
};