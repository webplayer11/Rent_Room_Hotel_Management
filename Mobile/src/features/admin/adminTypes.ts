// ---------------------------------------------------------------------------
// Admin types
// ---------------------------------------------------------------------------

export type AdminHotelStatus = 'approved' | 'pending' | 'need_update' | 'rejected' | 'blocked';

export type AdminAccountRole = 'customer' | 'business';

export type AdminAccountStatus = 'active' | 'blocked';

export type AdminTaskAction =
  | 'review_hotel'
  | 'review_report'
  | 'review_account'
  | 'system_alert';

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export type AdminDashboardStats = {
  totalHotels: number;
  pendingHotels: number;
  approvedHotels: number;
  totalAccounts: number;
  totalOwners: number;
  totalCustomers: number;
  monthlyCommission: string;
  totalBookings: number;
  commissionRate: number;
};

// ---------------------------------------------------------------------------
// Tasks / Alerts
// ---------------------------------------------------------------------------

export type AdminTask = {
  id: string;
  title: string;
  subtitle: string;
  type: 'warning' | 'danger' | 'info';
  action: AdminTaskAction;
  /** optional deep-link param, e.g. a hotel id */
  entityId?: string;
};

// ---------------------------------------------------------------------------
// Recent hotel submissions
// ---------------------------------------------------------------------------

export type AdminHotelSubmission = {
  id: string;
  hotelName: string;
  ownerName: string;
  submittedAt: string;
  status: AdminHotelStatus;
};

// ---------------------------------------------------------------------------
// Recent activity
// ---------------------------------------------------------------------------

export type AdminActivity = {
  id: string;
  icon: string; // Ionicons name
  message: string;
  time: string;
  type: 'hotel' | 'account' | 'booking' | 'system';
};

// ---------------------------------------------------------------------------
// Dashboard aggregate
// ---------------------------------------------------------------------------

export type AdminDashboardData = {
  adminName: string;
  unreadNotifications: number;
  stats: AdminDashboardStats;
  tasks: AdminTask[];
  recentSubmissions: AdminHotelSubmission[];
  recentActivity: AdminActivity[];
};

// ---------------------------------------------------------------------------
// Hotel management types
// ---------------------------------------------------------------------------

export type AdminLegalDocument = {
  id: string;
  name: string;
  type: 'business_license' | 'property_cert' | 'id_card' | 'other';
  fileName: string;
};

export type AdminHotelStatusHistory = {
  id: string;
  date: string;
  action: string;
  actor: 'owner' | 'admin';
  note?: string;
};

export type AdminBusinessInfo = {
  companyName: string;
  representativeName: string;
  email: string;
  phone: string;
  taxId?: string;
};

export type AdminHotelMetrics = {
  totalBookings: number;
  cancellationRate: string;
  averageRating: number;
  recentRevenue: string;
};

export type AdminHotel = {
  id: string;
  name: string;
  address: string;
  description?: string;
  thumbnailUrl?: string;
  status: AdminHotelStatus;
  submittedAt: string;
  updatedAt?: string;
  business: AdminBusinessInfo;
  legalDocuments: AdminLegalDocument[];
  statusHistory: AdminHotelStatusHistory[];
  metrics?: AdminHotelMetrics;
  adminNote?: string;
  rejectionReason?: string;
  roomCount?: number;
};

// ---------------------------------------------------------------------------
// Account management types
// ---------------------------------------------------------------------------

export type AdminAccountActivity = {
  id: string;
  date: string;
  action: string;
  detail?: string;
};

export type AdminCustomerBookingSummary = {
  id: string;
  hotelName: string;
  bookedAt: string;
  status: 'completed' | 'cancelled' | 'confirmed' | 'pending';
  amount: string;
};

export type AdminBusinessHotelSummary = {
  id: string;
  name: string;
  status: AdminHotelStatus;
};

export type AdminAccount = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: AdminAccountRole;
  status: AdminAccountStatus;
  createdAt: string;
  lastLoginAt?: string;
  blockReason?: string;
  // Customer fields
  totalBookings?: number;
  totalSpending?: string;
  completedBookings?: number;
  cancelledBookings?: number;
  recentBookings?: AdminCustomerBookingSummary[];
  // Business fields
  companyName?: string;
  hotels?: AdminBusinessHotelSummary[];
  // Shared
  activityLog: AdminAccountActivity[];
};

// ---------------------------------------------------------------------------
// Report types
// ---------------------------------------------------------------------------

export type AdminReportFilter = '7_days' | '30_days' | 'this_month' | 'last_month' | 'custom';

export type AdminRevenuePoint = {
  label: string;
  value: number;
};

export type AdminRevenueBreakdown = {
  totalTransaction: string;
  totalVouchers: string;
  ownerRevenue: string;
  platformCommission: string;
  commissionRate: number;
};

export type AdminTopHotelRevenue = {
  id: string;
  hotelName: string;
  companyName: string;
  totalTransaction: string;
  totalTransactionNum: number;
  commission: string;
  commissionNum: number;
  bookings: number;
  cancellationRate: string;
};

export type AdminReportData = {
  totalTransaction: string;
  platformCommission: string;
  totalBookings: number;
  cancellationRate: string;
  periodComparison: number;
  breakdown: AdminRevenueBreakdown;
  revenueChart: AdminRevenuePoint[];
  topHotels: AdminTopHotelRevenue[];
};
