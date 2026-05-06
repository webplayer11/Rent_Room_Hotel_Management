
Repo chung hiện tại:

Rent_Room_Hotel_Management

* Backend: API/database
* Frontend: web React/Vite, giữ lại làm phụ/tham khảo
* Mobile: app React Native/Expo, phần chính nhóm mình làm tiếp

Từ giờ mọi người KHÔNG tạo project mobile riêng nữa. Tất cả cùng làm trong folder:

Mobile

Cấu trúc Mobile:

Mobile/src/app/auth
Mobile/src/app/customer
Mobile/src/app/owner
Mobile/src/app/admin
Mobile/src/shared
Mobile/src/navigation

Ý nghĩa:

* auth: đăng nhập, đăng ký, quên mật khẩu
* customer: giao diện khách hàng
* owner: giao diện chủ khách sạn/chủ doanh nghiệp
* admin: giao diện quản trị viên
* shared: component, màu sắc, API dùng chung
* navigation: điều hướng màn hình

Phân công đề xuất:

1. Người 1: Auth

Làm trong folder:

Mobile/src/app/auth

Các màn cần làm:

* LoginScreen.tsx
* RegisterScreen.tsx
* ForgotPasswordScreen.tsx

Nghiệp vụ:

* Đăng nhập
* Đăng ký
* Quên mật khẩu
* Sau khi đăng nhập sẽ phân quyền theo role: customer / owner / admin

Branch làm việc:

feat/mobile-auth

2. Người 2: Customer

Làm trong folder:

Mobile/src/app/customer

Các màn cần làm:

* CustomerHomeScreen.tsx
* SearchHotelScreen.tsx
* HotelDetailScreen.tsx
* BookingFormScreen.tsx
* MyBookingsScreen.tsx
* PaymentMethodScreen.tsx
* FavoritesScreen.tsx
* NotificationsScreen.tsx
* WriteReviewScreen.tsx

Nghiệp vụ:

* Tìm kiếm khách sạn
* Xem chi tiết khách sạn
* Đặt phòng
* Thanh toán
* Xem lịch sử đặt phòng
* Hủy đặt phòng
* Đánh giá
* Yêu thích
* Nhận thông báo

Branch làm việc:

feat/mobile-customer

3. Người 3: Owner + Admin cơ bản

Làm trong 2 folder:

Mobile/src/app/owner
Mobile/src/app/admin

Các màn Owner cần làm:

* OwnerDashboardScreen.tsx
* OwnerHotelListScreen.tsx
* OwnerHotelFormScreen.tsx
* OwnerHotelDetailScreen.tsx
* OwnerRoomListScreen.tsx
* OwnerBookingListScreen.tsx
* OwnerPromotionListScreen.tsx
* OwnerRevenueReportScreen.tsx

Các màn Admin cơ bản cần làm:

* AdminDashboardScreen.tsx
* AdminHotelApprovalsScreen.tsx
* AdminUsersScreen.tsx
* AdminReportsScreen.tsx

Nghiệp vụ Owner:

* Dashboard chủ doanh nghiệp
* Quản lý khách sạn
* Thêm / sửa khách sạn
* Quản lý phòng
* Theo dõi đơn đặt phòng
* Quản lý khuyến mãi
* Xem doanh thu

Nghiệp vụ Admin:

* Dashboard admin
* Duyệt khách sạn
* Quản lý tài khoản
* Xem thống kê cơ bản

Branch làm việc:

feat/mobile-owner-admin

Quy định chung:

1. Không tạo project mobile riêng.
2. Không code lẫn sang folder của người khác nếu không cần.
3. Không dùng code web trong Mobile.
4. Mobile dùng React Native, nên dùng View, Text, Pressable, ScrollView, StyleSheet.
5. Không dùng div, button, table trong Mobile.
6. Component dùng chung đặt trong:

Mobile/src/shared/components

7. Màu dùng chung đặt trong:

Mobile/src/shared/constants/colors.ts

8. API dùng chung đặt trong:

Mobile/src/shared/api/apiClient.ts

9. Mỗi người làm trên branch riêng rồi tạo Pull Request vào main.
10. Trước khi làm phải pull code mới nhất từ main.

Lệnh mẫu khi bắt đầu làm:

git checkout main
git pull origin main
git checkout -b feat/mobile-auth

hoặc:

git checkout main
git pull origin main
git checkout -b feat/mobile-customer

hoặc:

git checkout main
git pull origin main
git checkout -b feat/mobile-owner-admin

Khi làm xong thì commit và push:

git add .
git commit -m "feat: add mobile auth screens"
git push origin feat/mobile-auth

hoặc đổi tên commit/branch theo phần mình làm.
