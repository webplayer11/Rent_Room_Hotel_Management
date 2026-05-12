# 🏨 Rent API — Hệ thống quản lý đặt phòng khách sạn

API RESTful được xây dựng bằng **ASP.NET Core 8**, áp dụng kiến trúc 3 layer (Controller → Service → Repository) với Entity Framework Core và SQL Server.

---

## 📋 Mục lục

- [Môi trường cần cài đặt](#-môi-trường-cần-cài-đặt)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Mối quan hệ các thực thể](#-mối-quan-hệ-các-thực-thể)
- [Quy trình cấu hình & tạo file](#-quy-trình-cấu-hình--tạo-file)
- [Danh sách API Endpoints](#-danh-sách-api-endpoints)
- [Cách test API](#-cách-test-api)
- [Cấu trúc Response chuẩn](#-cấu-trúc-response-chuẩn)

---

## 🛠 Môi trường cần cài đặt

### Bắt buộc

| Công cụ                             | Phiên bản    | Link tải                              |
| ----------------------------------- | ------------ | ------------------------------------- |
| .NET SDK                            | 8.0 trở lên  | https://dotnet.microsoft.com/download |
| SQL Server                          | 2019 trở lên | https://www.microsoft.com/sql-server  |
| SQL Server Management Studio (SSMS) | Mới nhất     | https://aka.ms/ssmsfullsetup          |

### Tuỳ chọn (khuyến nghị)

| Công cụ                    | Mục đích            |
| -------------------------- | ------------------- |
| Visual Studio 2022 / Rider | IDE phát triển      |
| Visual Studio Code         | Editor nhẹ          |
| Postman                    | Test API thủ công   |
| Git                        | Quản lý source code |

### Kiểm tra môi trường

```bash
dotnet --version      # phải >= 8.0
dotnet ef --version   # kiểm tra EF Core Tools
```

Nếu chưa có EF Core Tools:

```bash
dotnet tool install --global dotnet-ef
```

---

## 📁 Cấu trúc thư mục

```
RoomManagement/
│
├── Controllers/                    # Nhận HTTP request, trả response
│   ├── AuthController.cs
│   ├── BookingController.cs
│   ├── CustomerController.cs
│   ├── HotelController.cs
│   ├── HotelDeleteRequestController.cs
│   ├── InvoiceController.cs
│   ├── NotificationController.cs
│   ├── PaymentController.cs
│   ├── ReviewController.cs
│   ├── RoomController.cs
│   ├── VoucherController.cs
│   └── WishlistController.cs
│
├── Data/                           # Cấu hình database
│   └── AppDbContext.cs             # DbContext + Fluent API
│
├── DTOs/                           # Request & Response objects
│   ├── AccountDto.cs
│   ├── ResponseApi.cs              # Wrapper response dùng chung
│   ├── BookingDto.cs
│   ├── CustomerDto.cs
│   ├── HotelDto.cs
│   ├── HotelOwnerDto.cs
│   ├── InvoiceDto.cs
│   ├── NotificationDto.cs
│   ├── PaymentDto.cs
│   ├── ReviewDto.cs
│   ├── RoomDto.cs
│   ├── VoucherDto.cs
│   └── WishlistDto.cs
│
├── Extensions/                     # Extension methods
│   └── ServiceCollectionExtensions.cs  # Đăng ký DI toàn bộ
│
├── Filters/                        # Action filters
│   └── ValidationFilter.cs        # Tự động validate DTO → 400
│
├── Middlewares/                    # Custom middleware
│   └── GlobalExceptionMiddleware.cs    # Bắt lỗi toàn cục → JSON
│
├── Models/                         # Entity classes (ánh xạ DB)
│   ├── Account.cs
│   ├── Admin.cs
│   ├── ApplicationUser.cs
│   ├── Booking.cs
│   ├── Customer.cs
│   ├── Hotel.cs
│   ├── HotelAmenity.cs
│   ├── HotelImage.cs
│   ├── HotelOwner.cs
│   ├── Invoice.cs
│   ├── Notification.cs
│   ├── Payment.cs
│   ├── Promotion.cs
│   ├── RevenueReport.cs
│   ├── Review.cs
│   ├── Room.cs
│   ├── RoomImage.cs
│   ├── Voucher.cs
│   └── Wishlist.cs
│
├── Repositories/
│   ├── Interfaces/                 # Contract (16 interfaces)
│   │   ├── IGenericRepository.cs
│   │   ├── IAuthRepository.cs
│   │   ├── IAccountRepository.cs
│   │   ├── IBookingRepository.cs
│   │   ├── ICustomerRepository.cs
│   │   ├── IHotelAmenityRepository.cs
│   │   ├── IHotelDeleteRequestRepository.cs
│   │   ├── IHotelOwnerRepository.cs
│   │   ├── IHotelRepository.cs
│   │   ├── IInvoiceRepository.cs
│   │   ├── INotificationRepository.cs
│   │   ├── IPaymentRepository.cs
│   │   ├── IRevenueReportRepository.cs
│   │   ├── IReviewRepository.cs
│   │   ├── IRoomRepository.cs
│   │   ├── IVoucherRepository.cs
│   │   └── IWishlistRepository.cs
│   └── Implementations/            # Triển khai (17 classes)
│       ├── GenericRepository.cs
│       ├── AuthRepository.cs
│       ├── AccountRepository.cs
│       ├── BookingRepository.cs
│       ├── CustomerRepository.cs
│       ├── HotelAmenityRepository.cs
│       ├── HotelDeleteRequestRepository.cs
│       ├── HotelOwnerRepository.cs
│       ├── HotelRepository.cs
│       ├── InvoiceRepository.cs
│       ├── NotificationRepository.cs
│       ├── PaymentRepository.cs
│       ├── RevenueReportRepository.cs
│       ├── ReviewRepository.cs
│       ├── RoomRepository.cs
│       ├── VoucherRepository.cs
│       └── WishlistRepository.cs
│
├── Services/
│   ├── Interfaces/                 # Contract (11 interfaces)
│   │   ├── IBookingService.cs
│   │   ├── ICustomerService.cs
│   │   ├── IHotelDeleteRequestService.cs
│   │   ├── IHotelService.cs
│   │   ├── IInvoiceService.cs
│   │   ├── INotificationService.cs
│   │   ├── IPaymentService.cs
│   │   ├── IReviewService.cs
│   │   ├── IRoomService.cs
│   │   ├── IVoucherService.cs
│   │   └── IWishlistService.cs
│   └── Implementations/            # Triển khai (11 classes)
│       ├── BookingService.cs
│       ├── CustomerService.cs
│       ├── HotelDeleteRequestService.cs
│       ├── HotelService.cs
│       ├── InvoiceService.cs
│       ├── NotificationService.cs
│       ├── PaymentService.cs
│       ├── ReviewService.cs
│       ├── RoomService.cs
│       ├── VoucherService.cs
│       └── WishlistService.cs
│
├── appsettings.json                # Cấu hình production
├── appsettings.Development.json    # Cấu hình development (override)
└── Program.cs                      # Entry point — cấu hình pipeline
```

### Luồng xử lý request

```
HTTP Request
    │
    ▼
[Controller]        → nhận request, validate qua ValidationFilter
    │
    ▼
[Service]           → xử lý business logic (tính giá, kiểm tra điều kiện)
    │
    ▼
[Repository]        → truy vấn database qua EF Core
    │
    ▼
[Database]          → SQL Server
    │
    ▼
[Response]          → ResponseApi<T> JSON chuẩn hóa
```

---

## 🔗 Mối quan hệ các thực thể

### Sơ đồ tổng quan

```
Account (1) ──────────────────────────────┐
    │                                      │
    ├── (1) Customer                       ├── (1) HotelOwner
    │        │                             │        │
    │        ├── (nhiều) Booking           │        └── (nhiều) Hotel
    │        │        │                   │                 │
    │        │        ├── (nhiều) Payment  │                 ├── (nhiều) Room
    │        │        └── (nhiều) Invoice  │                 │        │
    │        │                            │                 │        ├── (nhiều) RoomImage
    │        ├── (nhiều) Review            │                 │        └── (nhiều) Booking
    │        ├── (nhiều) Wishlist          │                 │
    │        └── (nhiều) Notification      │                 ├── (nhiều) HotelImage
    │                                      │                 ├── (nhiều) Review
                                           │                 ├── (nhiều) RevenueReport
                                           │                 └── (nhiều↔nhiều) HotelAmenity
```

### Chi tiết quan hệ

| Thực thể A   | Quan hệ       | Thực thể B      | Ghi chú                            |
| ------------ | ------------- | --------------- | ---------------------------------- |
| `Account`    | 1 → 1         | `Customer`      | Một tài khoản là một khách hàng    |
| `Account`    | 1 → 1         | `HotelOwner`    | Một tài khoản là một chủ khách sạn |
| `HotelOwner` | 1 → nhiều     | `Hotel`         | Một chủ sở hữu nhiều khách sạn     |
| `Hotel`      | 1 → nhiều     | `Room`          | Một khách sạn có nhiều phòng       |
| `Hotel`      | 1 → nhiều     | `HotelImage`    | Cascade delete                     |
| `Hotel`      | nhiều ↔ nhiều | `HotelAmenity`  | Bảng trung gian `Hotel_Amenity`    |
| `Hotel`      | 1 → nhiều     | `Review`        |                                    |
| `Hotel`      | 1 → nhiều     | `RevenueReport` |                                    |
| `Room`       | 1 → nhiều     | `RoomImage`     | Cascade delete                     |
| `Room`       | 1 → nhiều     | `Booking`       |                                    |
| `Customer`   | 1 → nhiều     | `Booking`       |                                    |
| `Customer`   | 1 → nhiều     | `Review`        |                                    |
| `Customer`   | 1 → nhiều     | `Wishlist`      |                                    |
| `Customer`   | 1 → nhiều     | `Notification`  | Cascade delete                     |
| `Booking`    | 1 → nhiều     | `Payment`       |                                    |
| `Booking`    | 1 → nhiều     | `Invoice`       |                                    |

---

## ⚙️ Quy trình cấu hình & tạo file

### Bước 1 — Tạo project

```bash
dotnet new webapi -n YourProject
cd YourProject
```

### Bước 2 — Cài đặt packages

```bash
# EF Core + SQL Server
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.EntityFrameworkCore.Design

# Swagger
dotnet add package Swashbuckle.AspNetCore

# API Versioning
dotnet add package Asp.Versioning.Mvc

# Health Check
dotnet add package Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore

# JWT (khi cần Auth)
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer

# Unit Test
dotnet add package xunit
dotnet add package Moq
dotnet add package Microsoft.AspNetCore.Mvc.Testing
```

### Bước 3 — Cấu hình `appsettings.json`

```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost,1433;Database=RoomManagementDB;User Id=sa;Password=RoomPass@123;Integrated Security=false;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "YOUR_SECRET_KEY_MINIMUM_32_CHARACTERS",
    "Issuer": "RentApi",
    "Audience": "RentApiClient",
    "ExpiresInMinutes": 60,
    "RefreshTokenExpiresInDays": 7
  },
  "AllowedOrigins": ["http://localhost:3000", "http://localhost:5173"],
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Warning"
    }
  }
}
```

> ⚠️ Thêm `appsettings.Development.json` vào `.gitignore` nếu chứa thông tin nhạy cảm.

### Bước 4 — Tạo các file theo thứ tự

Thứ tự tạo file quan trọng vì có phụ thuộc lẫn nhau:

```
1. Models/          → Entity classes
2. Data/            → ApplicationDbContext
3. DTOs/            → Request/Response objects
4. Repositories/    → Interfaces trước, Implementations sau
5. Services/        → Interfaces trước, Implementations sau
6. Controllers/     → Inject Services
7. Filters/         → ValidationFilter
8. Middlewares/     → GlobalExceptionMiddleware
9. Extensions/      → ServiceCollectionExtensions (DI)
10. Program.cs      → Cấu hình pipeline
```

### Bước 5 — Cấu hình namespace

Thay toàn bộ `YourProject` bằng namespace thực tế của project. Dùng find & replace trong IDE:

```
Find:    YourProject
Replace: TênProjectThậtCủaBạn
```

### Bước 6 — Tạo Migration và Database

```bash
# Tạo migration đầu tiên
dotnet ef migrations add InitialCreate

# Kiểm tra migration (xem file được tạo trong Migrations/)
# Nếu đúng thì apply lên database
dotnet ef database update
```

### Bước 7 — Chạy project

```bash
dotnet run
# hoặc
dotnet watch run   # tự reload khi thay đổi code
```

Mở trình duyệt tại `https://localhost:{port}` → Swagger UI hiện ra.

---

## 🌐 Danh sách API Endpoints

Base URL: `https://localhost:{port}/api`

### Authentication (Auth)

| Method | Endpoint             | Mô tả               |
| ------ | -------------------- | ------------------- |
| `POST` | `/auth/register`     | Đăng ký tài khoản   |
| `POST` | `/auth/login`        | Đăng nhập           |
| `POST` | `/auth/logout`       | Đăng xuất           |
| `POST` | `/auth/refreshtoken` | Làm mới access token |

### Customer

| Method   | Endpoint         | Mô tả                  |
| -------- | ---------------- | ---------------------- |
| `GET`    | `/customer`      | Lấy tất cả khách hàng  |
| `GET`    | `/customer/{id}` | Lấy khách hàng theo id |
| `POST`   | `/customer`      | Tạo khách hàng mới     |
| `PUT`    | `/customer/{id}` | Cập nhật khách hàng    |
| `DELETE` | `/customer/{id}` | Xóa khách hàng         |

### Hotel

| Method   | Endpoint                 | Mô tả                     |
| -------- | ------------------------ | ------------------------- |
| `GET`    | `/hotel`                 | Lấy danh sách KS đã duyệt |
| `GET`    | `/hotel/{id}`            | Chi tiết khách sạn        |
| `GET`    | `/hotel/owner/{ownerId}` | KS theo chủ sở hữu        |
| `GET`    | `/hotel/search?keyword=` | Tìm kiếm khách sạn        |
| `POST`   | `/hotel`                 | Tạo khách sạn mới         |
| `PUT`    | `/hotel/{id}`            | Cập nhật khách sạn        |
| `PATCH`  | `/hotel/{id}/approve`    | Duyệt khách sạn           |
| `DELETE` | `/hotel/{id}`            | Xóa khách sạn             |

### Room

| Method   | Endpoint                                       | Mô tả                |
| -------- | ---------------------------------------------- | -------------------- |
| `GET`    | `/room/hotel/{hotelId}`                        | Phòng theo khách sạn |
| `GET`    | `/room/{id}`                                   | Chi tiết phòng       |
| `GET`    | `/room/available?hotelId=&startDate=&endDate=` | Phòng còn trống      |
| `POST`   | `/room`                                        | Tạo phòng mới        |
| `PUT`    | `/room/{id}`                                   | Cập nhật phòng       |
| `DELETE` | `/room/{id}`                                   | Xóa phòng            |

### Booking

| Method  | Endpoint                         | Mô tả                   |
| ------- | -------------------------------- | ----------------------- |
| `GET`   | `/booking/customer/{customerId}` | Booking theo khách hàng |
| `GET`   | `/booking/{id}`                  | Chi tiết booking        |
| `POST`  | `/booking`                       | Đặt phòng               |

### Payment

| Method | Endpoint                               | Mô tả                |
| ------ | -------------------------------------- | -------------------- |
| `GET`  | `/pay/booking/{bookingId}`             | Payment theo booking |
| `GET`  | `/pay/transaction/{transactionId}`     | Theo mã giao dịch    |
| `POST` | `/pay`                                 | Tạo thanh toán       |
| `POST` | `/pay/createpayment`                   | Tạo link thanh toán  |

### Hotel Delete Request

| Method  | Endpoint                         | Mô tả                   |
| ------- | -------------------------------- | ----------------------- |
| `POST`  | `/HotelDeleteRequest`            | Tạo yêu cầu xóa KS      |
| `GET`   | `/HotelDeleteRequest/my-requests`| DS yêu cầu của chủ KS   |
| `PATCH` | `/HotelDeleteRequest/{id}/cancel`| Hủy yêu cầu xóa         |

### Review

| Method   | Endpoint                         | Mô tả            |
| -------- | -------------------------------- | ---------------- |
| `GET`    | `/review/hotel/{hotelId}`        | Đánh giá theo KS |
| `GET`    | `/review/customer/{customerId}`  | Đánh giá theo KH |
| `GET`    | `/review/hotel/{hotelId}/rating` | Điểm trung bình  |
| `POST`   | `/review`                        | Tạo đánh giá     |
| `DELETE` | `/review/{id}`                   | Xóa đánh giá     |

### Wishlist

| Method   | Endpoint                          | Mô tả              |
| -------- | --------------------------------- | ------------------ |
| `GET`    | `/wishlist/customer/{customerId}` | DS yêu thích       |
| `POST`   | `/wishlist`                       | Thêm vào yêu thích |
| `DELETE` | `/wishlist?customerId=&hotelId=`  | Xóa khỏi yêu thích |

### Voucher

| Method   | Endpoint               | Mô tả                  |
| -------- | ---------------------- | ---------------------- |
| `GET`    | `/voucher`             | Voucher đang hoạt động |
| `GET`    | `/voucher/code/{code}` | Kiểm tra mã voucher    |
| `POST`   | `/voucher`             | Tạo voucher            |
| `DELETE` | `/voucher/{id}`        | Xóa voucher            |

### Notification

| Method  | Endpoint                                            | Mô tả             |
| ------- | --------------------------------------------------- | ----------------- |
| `GET`   | `/notification/customer/{customerId}`               | Thông báo theo KH |
| `GET`   | `/notification/customer/{customerId}/unread-count`  | Số chưa đọc       |
| `PATCH` | `/notification/customer/{customerId}/mark-all-read` | Đánh dấu đã đọc   |
| `POST`  | `/notification`                                     | Gửi thông báo     |

### Invoice

| Method | Endpoint                       | Mô tả                |
| ------ | ------------------------------ | -------------------- |
| `GET`  | `/invoice/{id}`                | Hóa đơn theo id      |
| `GET`  | `/invoice/booking/{bookingId}` | Hóa đơn theo booking |

### System

| Method | Endpoint  | Mô tả                               |
| ------ | --------- | ----------------------------------- |
| `GET`  | `/health` | Kiểm tra trạng thái API và database |

---

## 🧪 Cách test API

### 1. Swagger UI (nhanh nhất)

Chạy project và truy cập `https://localhost:{port}` — Swagger UI xuất hiện ngay tại root.

Ví dụ test `POST /api/booking`:

```json
{
  "id": "BK001",
  "customerId": "CUS001",
  "roomId": "ROOM001",
  "startDate": "2026-05-01",
  "endDate": "2026-05-05",
  "guestCount": 2,
  "specialRequest": "Tầng cao, view biển"
}
```

### 2. Postman

Import collection và test từng endpoint. Đặt `Content-Type: application/json` trong Headers.

Ví dụ tìm phòng trống:

```
GET https://localhost:7001/api/room/available
    ?hotelId=H001
    &startDate=2026-05-01
    &endDate=2026-05-05
```

### 3. Unit Test với xUnit + Moq

```bash
# Tạo project test
dotnet new xunit -n YourProject.Tests
cd YourProject.Tests
dotnet add reference ../YourProject/YourProject.csproj
dotnet add package Moq
```

Ví dụ test BookingService:

```csharp
[Fact]
public async Task CreateAsync_ShouldThrow_WhenRoomOverlaps()
{
    // Arrange
    _bookingRepoMock
        .Setup(r => r.HasOverlappingBookingAsync(
            It.IsAny<string>(), It.IsAny<DateOnly>(),
            It.IsAny<DateOnly>(), null))
        .ReturnsAsync(true);

    var dto = new CreateBookingDto(
        "BK001", "CUS001", "ROOM001",
        new DateOnly(2026, 5, 1), new DateOnly(2026, 5, 5), 2, null);

    // Act + Assert
    await Assert.ThrowsAsync<InvalidOperationException>(
        () => _service.CreateAsync(dto));
}
```

```bash
# Chạy tất cả tests
dotnet test

# Chạy với output chi tiết
dotnet test --verbosity normal
```

### 4. Health Check

```
GET https://localhost:{port}/health
```

Response khi OK:

```json
{
  "status": "Healthy",
  "results": {
    "database": { "status": "Healthy" }
  }
}
```

---

## 📦 Cấu trúc Response chuẩn

Mọi endpoint đều trả về `ResponseApi<T>`:

**Thành công:**

```json
{
  "isSuccess": true,
  "code": 200,
  "message": "Success",
  "data": { ... }
}
```

**Lỗi validation (400):**

```json
{
  "isSuccess": false,
  "code": 400,
  "message": "Dữ liệu đầu vào không hợp lệ.",
  "data": {
    "rating": ["Rating phải từ 1 đến 5."],
    "guestCount": ["Số khách phải từ 1 đến 50."]
  }
}
```

**Không tìm thấy (404):**

```json
{
  "isSuccess": false,
  "code": 404,
  "message": "Không tìm thấy khách sạn.",
  "data": null
}
```

**Lỗi server (500):**

```json
{
  "isSuccess": false,
  "code": 500,
  "message": "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
  "data": null
}
```

---

## 📝 Ghi chú

- Tất cả `id` trong project đều dùng kiểu `string` (VARCHAR 50) thay vì `int` để linh hoạt hơn khi tích hợp với các hệ thống bên ngoài.
- `DeleteBehavior.Restrict` được dùng mặc định để tránh xóa dữ liệu liên quan ngoài ý muốn, ngoại trừ `HotelImage`, `RoomImage`, `Notification` dùng `Cascade`.
- JWT Authentication đã được chuẩn bị sẵn trong `Program.cs`, chỉ cần bỏ comment khi cần bật.
- CORS đang dùng `AllowAll` cho Development. Khi deploy production phải chuyển sang `AllowFrontend` với đúng domain trong `appsettings.json`.
