import type { AdminDashboardData, AdminHotel, AdminAccount, AdminReportData } from './adminTypes';

export const adminDashboardMockData: AdminDashboardData = {
  adminName: 'Admin',
  unreadNotifications: 5,

  stats: {
    totalHotels: 42,
    pendingHotels: 7,
    approvedHotels: 33,
    totalAccounts: 318,
    totalOwners: 45,
    totalCustomers: 273,
    monthlyCommission: '18.4M',
    totalBookings: 1240,
    commissionRate: 15,
  },

  tasks: [
    {
      id: 'task-1',
      title: '7 khách sạn chờ phê duyệt',
      subtitle: 'Cần xem hồ sơ và duyệt hoặc từ chối',
      type: 'warning',
      action: 'review_hotel',
    },
    {
      id: 'task-2',
      title: '2 báo cáo vi phạm',
      subtitle: 'Khách báo cáo chất lượng không đúng mô tả',
      type: 'danger',
      action: 'review_report',
    },
    {
      id: 'task-3',
      title: '3 tài khoản chờ xác minh',
      subtitle: 'Owner mới cần xác minh thông tin pháp lý',
      type: 'info',
      action: 'review_account',
    },
  ],

  recentSubmissions: [
    {
      id: 'hotel-sub-1',
      hotelName: 'Sunrise Beach Hotel',
      ownerName: 'Nguyễn Văn Phúc',
      submittedAt: '05/05/2026',
      status: 'pending',
    },
    {
      id: 'hotel-sub-2',
      hotelName: 'Mountain View Lodge',
      ownerName: 'Trần Thị Hoa',
      submittedAt: '04/05/2026',
      status: 'pending',
    },
    {
      id: 'hotel-sub-3',
      hotelName: 'Central City Inn',
      ownerName: 'Lê Minh Đức',
      submittedAt: '03/05/2026',
      status: 'need_update',
    },
  ],

  recentActivity: [
    {
      id: 'act-1',
      icon: 'checkmark-circle-outline',
      message: 'Đã duyệt "Guma Hotel" của owner Nguyễn An',
      time: '10 phút trước',
      type: 'hotel',
    },
    {
      id: 'act-2',
      icon: 'person-add-outline',
      message: 'Tài khoản Owner mới đăng ký: Phạm Thu Hằng',
      time: '1 giờ trước',
      type: 'account',
    },
    {
      id: 'act-3',
      icon: 'close-circle-outline',
      message: 'Từ chối "Sky Tower Hotel" – thiếu giấy tờ',
      time: '3 giờ trước',
      type: 'hotel',
    },
    {
      id: 'act-4',
      icon: 'receipt-outline',
      message: 'Hoa hồng tháng 4 đã được tổng kết: 16.2M',
      time: 'Hôm qua',
      type: 'system',
    },
  ],
};

// ---------------------------------------------------------------------------
// Hotels mock data
// ---------------------------------------------------------------------------

export const adminHotelsMockData: AdminHotel[] = [
  {
    id: 'admin-hotel-1',
    name: 'Guma Hotel',
    address: '12 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    description: 'Khách sạn 4 sao nằm ngay trung tâm thành phố, tiện nghi đầy đủ.',
    status: 'approved',
    submittedAt: '20/04/2026',
    updatedAt: '22/04/2026',
    roomCount: 48,
    business: {
      companyName: 'Công ty TNHH Du lịch Biển Xanh',
      representativeName: 'Nguyễn Văn An',
      email: 'nguyen.an@gumahotel.vn',
      phone: '0901 234 567',
      taxId: '0312345678',
    },
    legalDocuments: [
      { id: 'doc-1', name: 'Giấy phép kinh doanh', type: 'business_license', fileName: 'giay_phep_kd_guma.pdf' },
      { id: 'doc-2', name: 'Giấy chứng nhận tài sản', type: 'property_cert', fileName: 'gcn_tai_san_guma.pdf' },
      { id: 'doc-3', name: 'CCCD người đại diện', type: 'id_card', fileName: 'cccd_nguyen_an.jpg' },
    ],
    statusHistory: [
      { id: 'h1-1', date: '20/04/2026', action: 'Owner gửi hồ sơ lần đầu', actor: 'owner' },
      { id: 'h1-2', date: '21/04/2026', action: 'Admin yêu cầu bổ sung CCCD', actor: 'admin', note: 'Cần ảnh CCCD rõ nét hơn' },
      { id: 'h1-3', date: '22/04/2026', action: 'Owner gửi lại hồ sơ', actor: 'owner' },
      { id: 'h1-4', date: '22/04/2026', action: 'Admin phê duyệt khách sạn', actor: 'admin' },
    ],
    metrics: {
      totalBookings: 312,
      cancellationRate: '4.2%',
      averageRating: 4.8,
      recentRevenue: '62.4M',
    },
  },
  {
    id: 'admin-hotel-2',
    name: 'Biển Xanh Resort',
    address: '88 Trần Phú, Nha Trang, Khánh Hòa',
    description: 'Resort ven biển, hồ bơi vô cực, view biển đẹp.',
    status: 'pending',
    submittedAt: '05/05/2026',
    roomCount: 32,
    business: {
      companyName: 'Công ty CP Du lịch Duyên Hải',
      representativeName: 'Trần Thị Mai',
      email: 'mai.tran@bienxanhresort.vn',
      phone: '0912 345 678',
      taxId: '0287654321',
    },
    legalDocuments: [
      { id: 'doc-4', name: 'Giấy phép kinh doanh', type: 'business_license', fileName: 'giay_phep_bien_xanh.pdf' },
      { id: 'doc-5', name: 'Giấy chứng nhận quyền sử dụng đất', type: 'property_cert', fileName: 'gcn_quyen_su_dung.pdf' },
    ],
    statusHistory: [
      { id: 'h2-1', date: '05/05/2026', action: 'Owner gửi hồ sơ lần đầu', actor: 'owner' },
    ],
  },
  {
    id: 'admin-hotel-3',
    name: 'Central Stay',
    address: '45 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    description: 'Khách sạn thương mại, phù hợp cho doanh nhân.',
    status: 'need_update',
    submittedAt: '28/04/2026',
    updatedAt: '30/04/2026',
    roomCount: 24,
    adminNote: 'Giấy phép kinh doanh bị mờ, thiếu giấy tờ pháp lý bất động sản. Vui lòng bổ sung ảnh rõ nét.',
    business: {
      companyName: 'Công ty TNHH Central Hospitality',
      representativeName: 'Lê Minh Tuấn',
      email: 'tuan.le@centralstay.vn',
      phone: '0923 456 789',
    },
    legalDocuments: [
      { id: 'doc-6', name: 'Giấy phép kinh doanh', type: 'business_license', fileName: 'giay_phep_central.pdf' },
    ],
    statusHistory: [
      { id: 'h3-1', date: '28/04/2026', action: 'Owner gửi hồ sơ lần đầu', actor: 'owner' },
      { id: 'h3-2', date: '30/04/2026', action: 'Admin yêu cầu bổ sung hồ sơ', actor: 'admin', note: 'Giấy phép kinh doanh bị mờ, thiếu giấy tờ pháp lý bất động sản.' },
    ],
  },
  {
    id: 'admin-hotel-4',
    name: 'Sky Tower Hotel',
    address: '200 Đinh Tiên Hoàng, Bình Thạnh, TP. Hồ Chí Minh',
    description: 'Khách sạn tầm cao, view toàn thành phố.',
    status: 'rejected',
    submittedAt: '01/05/2026',
    updatedAt: '03/05/2026',
    rejectionReason: 'Thông tin doanh nghiệp không trùng khớp với giấy phép kinh doanh. Hồ sơ có dấu hiệu làm giả.',
    business: {
      companyName: 'Công ty TNHH Sky Properties',
      representativeName: 'Phạm Văn Hùng',
      email: 'hung.pham@skytower.vn',
      phone: '0934 567 890',
    },
    legalDocuments: [
      { id: 'doc-7', name: 'Giấy phép kinh doanh', type: 'business_license', fileName: 'giay_phep_sky.pdf' },
      { id: 'doc-8', name: 'CCCD người đại diện', type: 'id_card', fileName: 'cccd_pham_hung.jpg' },
    ],
    statusHistory: [
      { id: 'h4-1', date: '01/05/2026', action: 'Owner gửi hồ sơ lần đầu', actor: 'owner' },
      { id: 'h4-2', date: '03/05/2026', action: 'Admin từ chối hồ sơ', actor: 'admin', note: 'Thông tin doanh nghiệp không trùng khớp.' },
    ],
  },
  {
    id: 'admin-hotel-5',
    name: 'Sunrise Beach Hotel',
    address: '15 Võ Nguyên Giáp, Đà Nẵng',
    description: 'Khách sạn biển Đà Nẵng, gần các điểm tham quan nổi tiếng.',
    status: 'blocked',
    submittedAt: '10/04/2026',
    updatedAt: '02/05/2026',
    roomCount: 60,
    adminNote: 'Tạm khóa do nhiều khiếu nại từ khách hàng về chất lượng dịch vụ không đúng mô tả.',
    business: {
      companyName: 'Công ty CP Sunrise Travel',
      representativeName: 'Nguyễn Thị Lan',
      email: 'lan.nguyen@sunrisebeach.vn',
      phone: '0945 678 901',
      taxId: '0398765432',
    },
    legalDocuments: [
      { id: 'doc-9', name: 'Giấy phép kinh doanh', type: 'business_license', fileName: 'giay_phep_sunrise.pdf' },
      { id: 'doc-10', name: 'Giấy chứng nhận tài sản', type: 'property_cert', fileName: 'gcn_sunrise.pdf' },
      { id: 'doc-11', name: 'CCCD người đại diện', type: 'id_card', fileName: 'cccd_nguyen_lan.jpg' },
    ],
    statusHistory: [
      { id: 'h5-1', date: '10/04/2026', action: 'Owner gửi hồ sơ lần đầu', actor: 'owner' },
      { id: 'h5-2', date: '12/04/2026', action: 'Admin phê duyệt khách sạn', actor: 'admin' },
      { id: 'h5-3', date: '02/05/2026', action: 'Admin tạm khóa khách sạn', actor: 'admin', note: 'Nhiều khiếu nại từ khách hàng.' },
    ],
    metrics: {
      totalBookings: 187,
      cancellationRate: '12.5%',
      averageRating: 2.9,
      recentRevenue: '24.1M',
    },
  },
];

// ---------------------------------------------------------------------------
// Accounts mock data
// ---------------------------------------------------------------------------

export const adminAccountsMockData: AdminAccount[] = [
  {
    id: 'acc-1',
    fullName: 'Nguyễn Thị Bích',
    email: 'bich.nguyen@gmail.com',
    phone: '0901 111 222',
    role: 'customer',
    status: 'active',
    createdAt: '10/01/2026',
    lastLoginAt: '05/05/2026',
    totalBookings: 12,
    totalSpending: '8.400.000đ',
    completedBookings: 10,
    cancelledBookings: 2,
    recentBookings: [
      { id: 'rb-1', hotelName: 'Guma Hotel', bookedAt: '20/04/2026', status: 'completed', amount: '1.200.000đ' },
      { id: 'rb-2', hotelName: 'Sunrise Beach Hotel', bookedAt: '01/05/2026', status: 'confirmed', amount: '2.400.000đ' },
      { id: 'rb-3', hotelName: 'Central Stay', bookedAt: '03/05/2026', status: 'cancelled', amount: '800.000đ' },
    ],
    activityLog: [
      { id: 'al-1', date: '10/01/2026', action: 'Tạo tài khoản' },
      { id: 'al-2', date: '20/04/2026', action: 'Đặt phòng', detail: 'Guma Hotel – Deluxe Double' },
      { id: 'al-3', date: '01/05/2026', action: 'Đặt phòng', detail: 'Sunrise Beach Hotel – Standard' },
      { id: 'al-4', date: '03/05/2026', action: 'Hủy đặt phòng', detail: 'Central Stay' },
      { id: 'al-5', date: '05/05/2026', action: 'Đăng nhập hệ thống' },
    ],
  },
  {
    id: 'acc-2',
    fullName: 'Trần Văn Khoa',
    email: 'khoa.tran@outlook.com',
    phone: '0912 333 444',
    role: 'customer',
    status: 'active',
    createdAt: '05/03/2026',
    lastLoginAt: '04/05/2026',
    totalBookings: 5,
    totalSpending: '3.200.000đ',
    completedBookings: 5,
    cancelledBookings: 0,
    recentBookings: [
      { id: 'rb-4', hotelName: 'Biển Xanh Resort', bookedAt: '10/04/2026', status: 'completed', amount: '3.200.000đ' },
    ],
    activityLog: [
      { id: 'al-6', date: '05/03/2026', action: 'Tạo tài khoản' },
      { id: 'al-7', date: '10/04/2026', action: 'Đặt phòng', detail: 'Biển Xanh Resort – Suite' },
      { id: 'al-8', date: '04/05/2026', action: 'Đăng nhập hệ thống' },
    ],
  },
  {
    id: 'acc-3',
    fullName: 'Lê Thị Hồng',
    email: 'hong.le@gmail.com',
    phone: '0923 555 666',
    role: 'customer',
    status: 'blocked',
    createdAt: '20/02/2026',
    lastLoginAt: '28/04/2026',
    blockReason: 'Tài khoản có dấu hiệu spam đánh giá giả mạo, vi phạm chính sách nền tảng.',
    totalBookings: 3,
    totalSpending: '1.500.000đ',
    completedBookings: 1,
    cancelledBookings: 2,
    recentBookings: [
      { id: 'rb-5', hotelName: 'Sky Tower Hotel', bookedAt: '15/04/2026', status: 'cancelled', amount: '600.000đ' },
    ],
    activityLog: [
      { id: 'al-9', date: '20/02/2026', action: 'Tạo tài khoản' },
      { id: 'al-10', date: '15/04/2026', action: 'Đặt phòng', detail: 'Sky Tower Hotel' },
      { id: 'al-11', date: '28/04/2026', action: 'Bị khóa tài khoản', detail: 'Spam đánh giá giả mạo' },
    ],
  },
  {
    id: 'acc-4',
    fullName: 'Nguyễn Văn An',
    email: 'nguyen.an@gumahotel.vn',
    phone: '0901 234 567',
    role: 'business',
    status: 'active',
    createdAt: '15/01/2026',
    lastLoginAt: '05/05/2026',
    companyName: 'Công ty TNHH Du lịch Biển Xanh',
    hotels: [
      { id: 'admin-hotel-1', name: 'Guma Hotel', status: 'approved' },
    ],
    activityLog: [
      { id: 'al-12', date: '15/01/2026', action: 'Tạo tài khoản doanh nghiệp' },
      { id: 'al-13', date: '20/04/2026', action: 'Gửi hồ sơ khách sạn', detail: 'Guma Hotel' },
      { id: 'al-14', date: '22/04/2026', action: 'Khách sạn được duyệt', detail: 'Guma Hotel' },
      { id: 'al-15', date: '05/05/2026', action: 'Đăng nhập hệ thống' },
    ],
  },
  {
    id: 'acc-5',
    fullName: 'Trần Thị Mai',
    email: 'mai.tran@bienxanhresort.vn',
    phone: '0912 345 678',
    role: 'business',
    status: 'active',
    createdAt: '01/02/2026',
    lastLoginAt: '05/05/2026',
    companyName: 'Công ty CP Du lịch Duyên Hải',
    hotels: [
      { id: 'admin-hotel-2', name: 'Biển Xanh Resort', status: 'pending' },
    ],
    activityLog: [
      { id: 'al-16', date: '01/02/2026', action: 'Tạo tài khoản doanh nghiệp' },
      { id: 'al-17', date: '05/05/2026', action: 'Gửi hồ sơ khách sạn', detail: 'Biển Xanh Resort' },
    ],
  },
  {
    id: 'acc-6',
    fullName: 'Nguyễn Thị Lan',
    email: 'lan.nguyen@sunrisebeach.vn',
    phone: '0945 678 901',
    role: 'business',
    status: 'blocked',
    createdAt: '05/01/2026',
    lastLoginAt: '02/05/2026',
    blockReason: 'Khách sạn bị nhiều khiếu nại, không hợp tác xử lý, vi phạm điều khoản dịch vụ.',
    companyName: 'Công ty CP Sunrise Travel',
    hotels: [
      { id: 'admin-hotel-5', name: 'Sunrise Beach Hotel', status: 'blocked' },
    ],
    activityLog: [
      { id: 'al-18', date: '05/01/2026', action: 'Tạo tài khoản doanh nghiệp' },
      { id: 'al-19', date: '10/04/2026', action: 'Gửi hồ sơ khách sạn', detail: 'Sunrise Beach Hotel' },
      { id: 'al-20', date: '12/04/2026', action: 'Khách sạn được duyệt', detail: 'Sunrise Beach Hotel' },
      { id: 'al-21', date: '02/05/2026', action: 'Bị khóa tài khoản', detail: 'Vi phạm điều khoản dịch vụ' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Report mock data
// ---------------------------------------------------------------------------

export const adminReportMockData: AdminReportData = {
  totalTransaction: '245.8M',
  platformCommission: '36.9M',
  totalBookings: 1240,
  cancellationRate: '6.3%',
  periodComparison: 12,

  breakdown: {
    totalTransaction: '245.8M',
    totalVouchers: '-12.4M',
    ownerRevenue: '196.5M',
    platformCommission: '36.9M',
    commissionRate: 15,
  },

  revenueChart: [
    { label: 'T2\n27/4', value: 28.4 },
    { label: 'T3\n28/4', value: 32.1 },
    { label: 'T4\n29/4', value: 25.6 },
    { label: 'T5\n30/4', value: 41.2 },
    { label: 'T6\n1/5', value: 38.7 },
    { label: 'T7\n2/5', value: 52.3 },
    { label: 'CN\n3/5', value: 27.5 },
  ],

  topHotels: [
    {
      id: 'admin-hotel-1',
      hotelName: 'Guma Hotel',
      companyName: 'CT TNHH Du lịch Biển Xanh',
      totalTransaction: '82.4M',
      totalTransactionNum: 82.4,
      commission: '12.4M',
      commissionNum: 12.4,
      bookings: 312,
      cancellationRate: '4.2%',
    },
    {
      id: 'admin-hotel-5',
      hotelName: 'Sunrise Beach Hotel',
      companyName: 'CT CP Sunrise Travel',
      totalTransaction: '64.1M',
      totalTransactionNum: 64.1,
      commission: '9.6M',
      commissionNum: 9.6,
      bookings: 187,
      cancellationRate: '12.5%',
    },
    {
      id: 'admin-hotel-2',
      hotelName: 'Biển Xanh Resort',
      companyName: 'CT CP Du lịch Duyên Hải',
      totalTransaction: '51.3M',
      totalTransactionNum: 51.3,
      commission: '7.7M',
      commissionNum: 7.7,
      bookings: 142,
      cancellationRate: '5.6%',
    },
    {
      id: 'admin-hotel-3',
      hotelName: 'Central Stay',
      companyName: 'CT TNHH Central Hospitality',
      totalTransaction: '28.7M',
      totalTransactionNum: 28.7,
      commission: '4.3M',
      commissionNum: 4.3,
      bookings: 98,
      cancellationRate: '3.1%',
    },
    {
      id: 'admin-hotel-4',
      hotelName: 'Sky Tower Hotel',
      companyName: 'CT TNHH Sky Properties',
      totalTransaction: '19.3M',
      totalTransactionNum: 19.3,
      commission: '2.9M',
      commissionNum: 2.9,
      bookings: 54,
      cancellationRate: '7.4%',
    },
  ],
};
