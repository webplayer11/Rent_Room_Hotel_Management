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
    { label: 'T2\n27/4', value: 4.2 },
    { label: 'T3\n28/4', value: 5.1 },
    { label: 'T4\n29/4', value: 3.8 },
    { label: 'T5\n30/4', value: 6.4 },
    { label: 'T6\n1/5', value: 7.2 },
    { label: 'T7\n2/5', value: 9.5 },
    { label: 'CN\n3/5', value: 8.1 },
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
      description: 'Khách sạn cao cấp giữa trung tâm thành phố, cách các địa điểm du lịch vài bước chân.',
      amenities: ['wifi', 'pool', 'restaurant', 'aircon'],
      checkInTime: '14:00',
      checkOutTime: '12:00',
      businessLicenseFileName: 'giay_phep_kinh_doanh.pdf',
      propertyDocumentFileName: 'giay_cn_quyen_su_dung.pdf',
      approvalNote: 'Khách sạn đã được duyệt và có thể kinh doanh.',
    },
    {
      id: 'hotel-2',
      name: 'Biển Xanh Resort',
      address: 'Đà Nẵng',
      roomCount: 36,
      status: 'pending',
      description: 'Khu nghỉ dưỡng ven biển lý tưởng cho gia đình.',
      amenities: ['wifi', 'pool', 'spa', 'airport_shuttle'],
      checkInTime: '15:00',
      checkOutTime: '11:00',
      businessLicenseFileName: 'giay_phep_kinh_doanh_bx.pdf',
      propertyDocumentFileName: 'giay_cn_quyen_su_dung_bx.pdf',
      approvalNote: 'Hồ sơ đang chờ admin xét duyệt.',
    },
    {
      id: 'hotel-3',
      name: 'Central Stay',
      address: 'Hà Nội',
      roomCount: 18,
      status: 'need_update',
      description: 'Khách sạn tiện lợi dành cho khách công tác.',
      amenities: ['wifi', 'aircon', 'laundry'],
      checkInTime: '14:00',
      checkOutTime: '12:00',
      businessLicenseFileName: null,
      propertyDocumentFileName: 'giay_cn_quyen_su_dung_cs.pdf',
      approvalNote: 'Thiếu giấy phép kinh doanh. Vui lòng bổ sung.',
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

// ---------------------------------------------------------------------------
// Revenue Report mock data
// ---------------------------------------------------------------------------

export const revenueReportMockData: import('./ownerTypes').OwnerRevenueReportData = {
  netRevenue: '74.2M',
  totalBookings: 128,
  completedBookings: 96,
  occupancyRate: '76%',
  periodComparison: 12,
  breakdown: {
    grossRevenue: '95.0M',
    vouchers: '-6.5M',
    paidAmount: '88.5M',
    commissionRate: 16,
    commissionAmount: '-14.3M',
    netRevenue: '74.2M',
  },
  revenue7Days: [
    { label: 'T2\n27/4', value: 4.2 },
    { label: 'T3\n28/4', value: 5.1 },
    { label: 'T4\n29/4', value: 3.8 },
    { label: 'T5\n30/4', value: 6.4 },
    { label: 'T6\n1/5', value: 7.2 },
    { label: 'T7\n2/5', value: 9.5 },
    { label: 'CN\n3/5', value: 8.1 },
  ],
  hotelSummaries: [
    {
      id: 'hotel-1',
      name: 'Guma Hotel',
      netRevenue: '45.2M',
      bookings: 68,
      occupancyRate: 82,
      trend: 15,
    },
    {
      id: 'hotel-2',
      name: 'Biển Xanh Resort',
      netRevenue: '28.6M',
      bookings: 42,
      occupancyRate: 74,
      trend: -5,
    },
  ],
  insights: [
    {
      id: 'insight-1',
      message: 'Guma Hotel đang có hiệu suất đặt phòng tốt nhất.',
      type: 'success',
    },
    {
      id: 'insight-2',
      message: 'Tỷ lệ lấp đầy dưới 30% tại một số phòng cuối tuần.',
      type: 'warning',
    },
    {
      id: 'insight-3',
      message: 'Central Stay cần bổ sung hồ sơ nên chưa được tính doanh thu.',
      type: 'info',
    },
    {
      id: 'insight-4',
      message: '3 đơn bị hủy liên tiếp tại Biển Xanh Resort.',
      type: 'danger',
    },
  ],
};

// ---------------------------------------------------------------------------
// Room list mock data
// ---------------------------------------------------------------------------

export const ownerRoomsMockData: import('./ownerTypes').OwnerRoom[] = [
  {
    id: 'room-1',
    name: 'Phòng 101',
    hotelName: 'Guma Hotel',
    roomType: 'Standard Twin',
    pricePerNight: '950.000đ',
    capacity: 2,
    status: 'available',
  },
  {
    id: 'room-2',
    name: 'Phòng 102',
    hotelName: 'Guma Hotel',
    roomType: 'Deluxe Double',
    pricePerNight: '1.200.000đ',
    capacity: 2,
    status: 'booked',
  },
  {
    id: 'room-3',
    name: 'Phòng 201',
    hotelName: 'Biển Xanh Resort',
    roomType: 'Superior Twin',
    pricePerNight: '1.600.000đ',
    capacity: 2,
    status: 'maintenance',
  },
  {
    id: 'room-4',
    name: 'Phòng 202',
    hotelName: 'Biển Xanh Resort',
    roomType: 'Family Suite',
    pricePerNight: '3.500.000đ',
    capacity: 4,
    status: 'available',
  },
  {
    id: 'room-5',
    name: 'Phòng 301',
    hotelName: 'Central Stay',
    roomType: 'Standard Single',
    pricePerNight: '650.000đ',
    capacity: 1,
    status: 'booked',
  },
];

// ---------------------------------------------------------------------------
// Profile mock data
// ---------------------------------------------------------------------------

export const ownerProfileMockData: import('./ownerTypes').OwnerProfile = {
  fullName: 'Nguyễn Văn An',
  phone: '0901234567',
  email: 'an.nguyen@bienxanh.com',
  avatarUrl: undefined,
  businessInfo: {
    companyName: 'Công ty TNHH Du lịch Biển Xanh',
    taxId: '0101234567',
    address: '123 Đường Ven Biển, Quận 1, TP. Hồ Chí Minh',
    representativeName: 'Nguyễn Văn An',
    verificationStatus: 'verified',
  },
};

// ---------------------------------------------------------------------------
// Reviews mock data
// ---------------------------------------------------------------------------

export const ownerReviewsMockData: import('./ownerTypes').OwnerReview[] = [
  {
    id: 'rev-1',
    hotelId: 'hotel-1',
    hotelName: 'Guma Hotel',
    roomType: 'Deluxe Double',
    customerName: 'Nguyễn Văn Hùng',
    rating: 5,
    content: 'Phòng sạch, nhân viên thân thiện, vị trí ngay trung tâm rất tiện lợi.',
    date: '06/05/2026',
  },
  {
    id: 'rev-2',
    hotelId: 'hotel-1',
    hotelName: 'Guma Hotel',
    roomType: 'Standard Single',
    customerName: 'Trần Thị Mai',
    rating: 4,
    content: 'Vị trí thuận tiện, phòng ổn nhưng cách âm chưa tốt lắm.',
    date: '04/05/2026',
    reply: 'Cảm ơn bạn đã góp ý. Khách sạn sẽ cải thiện hệ thống cách âm trong thời gian tới.',
  },
  {
    id: 'rev-3',
    hotelId: 'hotel-1',
    hotelName: 'Guma Hotel',
    roomType: 'Superior Twin',
    customerName: 'Lê Minh Tuấn',
    rating: 3,
    content: 'Check-in hơi chậm, bù lại phòng ốc rất sạch sẽ và tiện nghi.',
    date: '02/05/2026',
  },
];

// ---------------------------------------------------------------------------
// Promotions mock data
// ---------------------------------------------------------------------------

export const ownerPromotionsMockData: import('./ownerTypes').OwnerPromotion[] = [
  {
    id: 'promo-1',
    hotelId: 'hotel-1',
    hotelName: 'Guma Hotel',
    title: 'Ưu đãi hè 2026',
    code: 'SUMMER20',
    discountPercent: 20,
    startDate: '01/06/2026',
    endDate: '31/08/2026',
    status: 'active',
    maxUsage: 100,
    currentUsage: 45,
    description: 'Giảm 20% cho tất cả các phòng trong mùa hè.',
  },
  {
    id: 'promo-2',
    hotelId: 'hotel-1',
    hotelName: 'Guma Hotel',
    title: 'Đặt sớm tiết kiệm',
    code: 'EARLY15',
    discountPercent: 15,
    startDate: '01/09/2026',
    endDate: '30/11/2026',
    status: 'upcoming',
    currentUsage: 0,
    description: 'Giảm 15% khi đặt trước 30 ngày.',
  },
  {
    id: 'promo-3',
    hotelId: 'hotel-1',
    hotelName: 'Guma Hotel',
    title: 'Cuối tuần vui vẻ',
    code: 'WEEKEND10',
    discountPercent: 10,
    startDate: '01/01/2026',
    endDate: '31/12/2026',
    status: 'paused',
    maxUsage: 500,
    currentUsage: 120,
    description: 'Giảm 10% cho các đặt phòng vào thứ 7 và Chủ nhật.',
  },
];

// ---------------------------------------------------------------------------
// Notifications mock data
// ---------------------------------------------------------------------------

export const ownerNotificationsMockData: import('./ownerTypes').OwnerNotification[] = [
  {
    id: 'notif-1',
    type: 'booking',
    title: 'Đơn đặt phòng mới',
    message: '2 đơn đặt phòng đang chờ xác nhận',
    date: '5 phút trước',
    isRead: false,
  },
  {
    id: 'notif-2',
    type: 'review',
    title: 'Đánh giá mới',
    message: 'Bạn có 1 đánh giá mới từ khách hàng',
    date: '1 giờ trước',
    isRead: false,
  },
  {
    id: 'notif-3',
    type: 'hotel',
    title: 'Khách sạn cần cập nhật',
    message: 'Central Stay cần bổ sung hồ sơ',
    date: 'Hôm qua',
    isRead: false,
    dataId: 'hotel-3',
  },
  {
    id: 'notif-4',
    type: 'hotel',
    title: 'Khách sạn đã được duyệt',
    message: 'Guma Hotel đã được duyệt và có thể kinh doanh',
    date: '2 ngày trước',
    isRead: true,
    dataId: 'hotel-1',
  },
  {
    id: 'notif-5',
    type: 'promotion',
    title: 'Khuyến mãi sắp hết hạn',
    message: 'Khuyến mãi SUMMER20 sắp hết hạn trong 3 ngày tới',
    date: '3 ngày trước',
    isRead: true,
  },
];