import type { HotelAmenity, HotelFormData, HotelLegalDocument, OwnerDashboardData } from './ownerTypes';

// ---------------------------------------------------------------------------
// Dashboard mock data
// ---------------------------------------------------------------------------

export const ownerDashboardMockData: OwnerDashboardData = {
  ownerName: 'An',
  companyName: 'Công ty TNHH Du lịch Biển Xanh',
  unreadNotifications: 3,

  stats: {
    totalHotels: 3,
    totalBookings: 128,
    monthlyRevenue: '82.5M',
    pendingHotelApprovals: 1,
    pendingBookingConfirmations: 2,
  },

  alerts: [
    {
      id: 'alert-1',
      message: '2 đơn chờ xác nhận',
      type: 'warning',
      action: 'pending_bookings',
    },
    {
      id: 'alert-2',
      message: '1 đánh giá mới',
      type: 'info',
      action: 'new_reviews',
    },
    {
      id: 'alert-3',
      message: '1 khách sạn cần bổ sung hồ sơ',
      type: 'danger',
      action: 'update_hotel_docs',
    },
  ],

  revenue7Days: [
    { label: 'T2', value: 4.2 },
    { label: 'T3', value: 5.1 },
    { label: 'T4', value: 3.8 },
    { label: 'T5', value: 6.4 },
    { label: 'T6', value: 7.2 },
    { label: 'T7', value: 9.5 },
    { label: 'CN', value: 8.1 },
  ],

  recentBookings: [
    {
      id: 'booking-1',
      code: 'BK001',
      customerName: 'Nguyễn Văn Hùng',
      hotelName: 'Guma Hotel',
      roomType: 'Deluxe Double',
      checkInDate: '30/04/2026',
      checkOutDate: '02/05/2026',
      nights: 2,
      totalAmount: '1.200.000đ',
      status: 'pending',
    },
    {
      id: 'booking-2',
      code: 'BK002',
      customerName: 'Trần Thị Mai',
      hotelName: 'Biển Xanh Resort',
      roomType: 'Superior Twin',
      checkInDate: '01/05/2026',
      checkOutDate: '04/05/2026',
      nights: 3,
      totalAmount: '2.400.000đ',
      status: 'confirmed',
    },
    {
      id: 'booking-3',
      code: 'BK003',
      customerName: 'Lê Minh Tuấn',
      hotelName: 'Central Stay',
      roomType: 'Standard Single',
      checkInDate: '28/04/2026',
      checkOutDate: '29/04/2026',
      nights: 1,
      totalAmount: '650.000đ',
      status: 'checked_in',
    },
  ],

  hotels: [
    {
      id: 'hotel-1',
      name: 'Guma Hotel',
      address: 'TP. Hồ Chí Minh',
      roomCount: 24,
      status: 'approved',
      rating: 4.8,
      monthlyBookings: 32,
    },
    {
      id: 'hotel-2',
      name: 'Biển Xanh Resort',
      address: 'Đà Nẵng',
      roomCount: 36,
      status: 'pending',
    },
    {
      id: 'hotel-3',
      name: 'Central Stay',
      address: 'Hà Nội',
      roomCount: 18,
      status: 'need_update',
    },
  ],
};

// ---------------------------------------------------------------------------
// Booking list mock data (full list with all statuses)
// ---------------------------------------------------------------------------

export const ownerBookingsMockData: import('./ownerTypes').OwnerBooking[] = [
  {
    id: 'booking-1',
    code: 'BK001',
    customerName: 'Nguyễn Văn Hùng',
    hotelName: 'Guma Hotel',
    roomType: 'Deluxe Double',
    checkInDate: '30/04/2026',
    checkOutDate: '02/05/2026',
    nights: 2,
    totalAmount: '1.200.000đ',
    status: 'pending',
  },
  {
    id: 'booking-4',
    code: 'BK004',
    customerName: 'Phạm Thị Lan',
    hotelName: 'Guma Hotel',
    roomType: 'Standard Twin',
    checkInDate: '01/05/2026',
    checkOutDate: '03/05/2026',
    nights: 2,
    totalAmount: '950.000đ',
    status: 'pending',
  },
  {
    id: 'booking-2',
    code: 'BK002',
    customerName: 'Trần Thị Mai',
    hotelName: 'Biển Xanh Resort',
    roomType: 'Superior Twin',
    checkInDate: '01/05/2026',
    checkOutDate: '04/05/2026',
    nights: 3,
    totalAmount: '2.400.000đ',
    status: 'confirmed',
  },
  {
    id: 'booking-3',
    code: 'BK003',
    customerName: 'Lê Minh Tuấn',
    hotelName: 'Central Stay',
    roomType: 'Standard Single',
    checkInDate: '28/04/2026',
    checkOutDate: '29/04/2026',
    nights: 1,
    totalAmount: '650.000đ',
    status: 'checked_in',
  },
  {
    id: 'booking-5',
    code: 'BK005',
    customerName: 'Võ Văn Đức',
    hotelName: 'Guma Hotel',
    roomType: 'Deluxe Double',
    checkInDate: '20/04/2026',
    checkOutDate: '22/04/2026',
    nights: 2,
    totalAmount: '1.200.000đ',
    status: 'checked_out',
  },
  {
    id: 'booking-6',
    code: 'BK006',
    customerName: 'Hoàng Thị Ngọc',
    hotelName: 'Biển Xanh Resort',
    roomType: 'Superior Twin',
    checkInDate: '25/04/2026',
    checkOutDate: '27/04/2026',
    nights: 2,
    totalAmount: '1.600.000đ',
    status: 'cancelled_by_customer',
  },
  {
    id: 'booking-7',
    code: 'BK007',
    customerName: 'Đặng Quốc Bảo',
    hotelName: 'Central Stay',
    roomType: 'Standard Single',
    checkInDate: '26/04/2026',
    checkOutDate: '28/04/2026',
    nights: 2,
    totalAmount: '1.300.000đ',
    status: 'rejected_by_owner',
  },
];

// ---------------------------------------------------------------------------
// Hotel Form mock data
// ---------------------------------------------------------------------------

export const amenityOptions: HotelAmenity[] = [
  { id: 'wifi', label: 'Wifi' },
  { id: 'pool', label: 'Hồ bơi' },
  { id: 'parking', label: 'Bãi đỗ xe' },
  { id: 'restaurant', label: 'Nhà hàng' },
  { id: 'aircon', label: 'Điều hòa' },
  { id: 'airport_shuttle', label: 'Đưa đón sân bay' },
  { id: 'gym', label: 'Phòng gym' },
  { id: 'spa', label: 'Spa' },
  { id: 'laundry', label: 'Giặt ủi' },
  { id: 'room_service', label: 'Dịch vụ phòng' },
];

export const defaultLegalDocuments: HotelLegalDocument[] = [
  {
    id: 'business_license',
    label: 'Giấy phép kinh doanh',
    fileName: null,
  },
  {
    id: 'property_cert',
    label: 'Giấy chứng nhận quyền sử dụng tài sản',
    fileName: null,
  },
];

export const defaultHotelFormData: HotelFormData = {
  name: '',
  street: '',
  district: '',
  city: '',
  phone: '',
  email: '',
  description: '',
  coverImage: null,
  galleryImages: [],
  selectedAmenities: [],
  checkInTime: '',
  checkOutTime: '',
  cancellationPolicy: '',
  houseRules: '',
  legalDocuments: defaultLegalDocuments.map((doc) => ({ ...doc })),
};

/** Sample file names used when simulating upload */
export const sampleFileNames = {
  coverImage: 'hotel_cover_photo.jpg',
  galleryImage: 'hotel_gallery_01.jpg',
  businessLicense: 'giay_phep_kinh_doanh.pdf',
  propertyCert: 'giay_cn_quyen_su_dung.pdf',
};