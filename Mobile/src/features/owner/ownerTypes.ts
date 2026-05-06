export type HotelStatus = 'approved' | 'pending' | 'need_update';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled_by_customer'
  | 'rejected_by_owner';

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
  description?: string;
  amenities?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  thumbnailUrl?: string;
  galleryImages?: string[];
  businessLicenseFileName?: string | null;
  propertyDocumentFileName?: string | null;
  approvalNote?: string;
};

export type OwnerBooking = {
  id: string;
  code: string;
  customerName: string;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
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
// Profile types
// ---------------------------------------------------------------------------

export type OwnerBusinessProfile = {
  companyName: string;
  taxId: string;
  address: string;
  representativeName: string;
  verificationStatus: 'verified' | 'unverified';
};

export type OwnerProfile = {
  fullName: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  businessInfo: OwnerBusinessProfile;
};

// ---------------------------------------------------------------------------
// Room Management types
// ---------------------------------------------------------------------------

export type RoomStatus = 'available' | 'booked' | 'maintenance';

export type OwnerRoom = {
  id: string;
  name: string;
  hotelName: string;
  roomType: string;
  pricePerNight: string;
  capacity: number;
  status: RoomStatus;
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
  uri?: string;
};

export type HotelLegalDocument = {
  id: string;
  label: string;
  fileName: string | null;
  uri?: string;
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

// ---------------------------------------------------------------------------
// Revenue Report types
// ---------------------------------------------------------------------------

export type RevenueTimeFilter = '7_days' | '30_days' | 'this_month' | 'last_month' | 'custom';

export type RevenueBreakdown = {
  grossRevenue: string;
  vouchers: string;
  paidAmount: string;
  commissionAmount: string;
  commissionRate: number;
  netRevenue: string;
};

export type HotelRevenueSummary = {
  id: string;
  name: string;
  netRevenue: string;
  bookings: number;
  occupancyRate: number;
  trend?: number; // percentage change
};

export type BusinessInsight = {
  id: string;
  message: string;
  type: 'warning' | 'danger' | 'success' | 'info';
};

export type OwnerRevenueReportData = {
  netRevenue: string;
  totalBookings: number;
  completedBookings: number;
  occupancyRate: string;
  periodComparison: number; // e.g. 12 or -8
  breakdown: RevenueBreakdown;
  revenue7Days: RevenuePoint[];
  hotelSummaries: HotelRevenueSummary[];
  insights: BusinessInsight[];
};

// ---------------------------------------------------------------------------
// Review types
// ---------------------------------------------------------------------------

export type ReviewFilter = 'all' | '5_star' | '4_star' | 'under_4_star' | 'unreplied';

export type OwnerReview = {
  id: string;
  hotelId: string;
  hotelName: string;
  roomType?: string;
  customerName: string;
  rating: number;
  content: string;
  date: string;
  reply?: string;
};

// ---------------------------------------------------------------------------
// Promotion types
// ---------------------------------------------------------------------------

export type PromotionStatus = 'active' | 'upcoming' | 'expired' | 'paused';
export type PromotionFilter = 'all' | PromotionStatus;

export type OwnerPromotion = {
  id: string;
  hotelId: string;
  hotelName: string;
  title: string;
  code: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  maxUsage?: number;
  currentUsage: number;
  description?: string;
};

// ---------------------------------------------------------------------------
// Notification types
// ---------------------------------------------------------------------------

export type NotificationType = 'booking' | 'hotel' | 'review' | 'promotion' | 'system';
export type NotificationFilter = 'all' | 'unread' | NotificationType;

export type OwnerNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  dataId?: string;
};