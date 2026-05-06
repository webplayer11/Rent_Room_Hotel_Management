# Phân công Frontend

Project Frontend được chia theo 4 module chính:

## 1. Auth - Dùng chung cho tất cả actor
Folder làm việc:

src/app/pages/auth

Chức năng:
- Đăng nhập
- Đăng ký
- Quên mật khẩu
- Phân quyền sau đăng nhập theo role: customer / owner / admin

## 2. Customer - Khách hàng
Folder làm việc:

src/app/pages/customer

Chức năng:
- Trang chủ khách hàng
- Tìm kiếm khách sạn
- Xem chi tiết khách sạn
- Đặt phòng
- Thanh toán
- Lịch sử đặt phòng
- Hủy đặt phòng
- Đánh giá khách sạn
- Danh sách yêu thích
- Thông báo

## 3. Owner - Chủ doanh nghiệp / Chủ khách sạn
Folder làm việc:

src/app/pages/owner

Chức năng:
- Dashboard chủ doanh nghiệp
- Quản lý khách sạn
- Thêm / sửa khách sạn
- Quản lý phòng
- Quản lý đơn đặt phòng
- Quản lý khuyến mãi
- Theo dõi doanh thu
- Nhận thông báo

## 4. Admin - Quản trị viên
Folder làm việc:

src/app/pages/admin

Chức năng:
- Dashboard admin
- Quản lý tài khoản
- Duyệt khách sạn
- Quản lý tiện nghi
- Quản lý giao dịch
- Quản lý doanh thu / hoa hồng
- Quản lý voucher
- Quản lý đánh giá
- Thống kê hệ thống

## Quy định chung

1. Không code giao diện trực tiếp ngoài folder mình phụ trách.
2. Component dùng chung đặt trong:

src/app/shared/components

3. API dùng chung đặt trong:

src/app/shared/api/apiClient.ts

4. Màu sắc dùng chung đặt trong:

src/app/shared/constants

5. Không gọi axios trực tiếp trong từng màn hình. Phải gọi qua apiClient.
6. Không push trực tiếp vào main. Mỗi người tạo branch riêng rồi Pull Request.