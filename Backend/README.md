# 🏠 Room Management API

Dự án quản lý đặt phòng đơn giản, xây dựng bằng **ASP.NET Core 10 Web API** + **SQL Server**.

---

## 📋 Yêu cầu

| Công cụ | Mục đích | Link |
|---------|---------|------|
| .NET 10 SDK | Chạy API | [Tải về](https://dotnet.microsoft.com/download/dotnet/10.0) |
| Docker Desktop | Chạy SQL Server (không cần cài SQL Server lên máy) | [Tải về](https://www.docker.com/products/docker-desktop/) |
| VS Code + C# Dev Kit | IDE | [Tải về](https://code.visualstudio.com/) |

---

## ⚙️ Cài đặt

### 1. Cài .NET 10 SDK

**macOS:**
```bash
brew install --cask dotnet-sdk
```
**Windows:** Tải và cài từ https://dotnet.microsoft.com/download/dotnet/10.0

Kiểm tra:
```bash
dotnet --version  # 10.x.x
```

### 2. Khởi động SQL Server bằng Docker

```bash
# Ở thư mục root của project (có file docker-compose.yml)
docker compose up -d
```

SQL Server sẽ chạy tại `localhost:1433` với thông tin:
- **User:** `sa`
- **Password:** `RoomPass@123`
- **Database:** `RoomManagementDB` *(tự tạo khi migrate)*

> Connection string đã được cấu hình sẵn trong `appsettings.json`, **không cần sửa gì thêm**.

### 3. Cài extension VS Code

Vào Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`), cài:
- **C# Dev Kit** (của Microsoft)

---

## 🚀 Chạy project

```bash
# 1. Clone về
git clone <link-repo>
cd RoomManagement

# 2. Khởi động SQL Server
docker compose up -d

# 4. Tạo database (chỉ làm lần đầu)
dotnet tool install --global dotnet-ef   # nếu chưa cài
dotnet ef migrations add InitialCreate
dotnet ef database update

# 5. Chạy API
dotnet run
```

Mở trình duyệt: **http://localhost:5000/swagger**

**Lệnh Docker hữu ích:**
```bash
docker compose up -d      # Khởi động SQL Server
docker compose down       # Dừng SQL Server
docker compose down -v    # Dừng và xoá toàn bộ data DB
```


---

## 📁 Cấu trúc project

```
src/RoomManagement/
│
├── Controllers/              # Nhận request, trả response
│   ├── AuthController.cs     # Đăng ký, đăng nhập
│   ├── RoomsController.cs    # CRUD phòng
│   └── BookingsController.cs # Đặt phòng, huỷ phòng
│
├── Models/                   # Cấu trúc dữ liệu (bảng trong DB)
│   ├── User.cs
│   ├── Room.cs
│   ├── Booking.cs
│   └── AppDbContext.cs       # Kết nối database
│
├── DTOs/                     # Định dạng dữ liệu gửi/nhận qua API
│   ├── AuthDtos.cs
│   ├── RoomDtos.cs
│   └── BookingDtos.cs
│
├── Services/                 # Logic nghiệp vụ
│   ├── AuthService.cs
│   ├── RoomService.cs
│   └── BookingService.cs
│
├── Program.cs                # Cấu hình app (entry point)
└── appsettings.json          # Cấu hình (DB, JWT...)
```

---

## 🔄 Luồng hoạt động (Request Flow)

Mỗi request từ client đi qua **3 lớp** theo thứ tự sau:

```
Client (Postman / Swagger / Frontend)
        │
        │  HTTP Request (JSON)
        ▼
┌─────────────────────────────────────────┐
│           Controller                    │  ← Nhận request, validate đầu vào
│   (Controllers/*.cs)                    │     Trả về HTTP response (200, 400, 401...)
└─────────────────┬───────────────────────┘
                  │  Gọi Service
                  ▼
┌─────────────────────────────────────────┐
│             Service                     │  ← Xử lý logic nghiệp vụ
│   (Services/*.cs)                       │     Kiểm tra điều kiện, tính toán
└─────────────────┬───────────────────────┘
                  │  Dùng DbContext
                  ▼
┌─────────────────────────────────────────┐
│         Model / Database                │  ← Đọc/ghi dữ liệu vào SQL Server
│   (Models/*.cs + AppDbContext.cs)       │
└─────────────────────────────────────────┘
```

### Ví dụ cụ thể: Khách đặt phòng `POST /api/bookings`

```
1. [Controller] BookingsController.Create()
      │  Nhận CreateBookingRequest từ body JSON
      │  Lấy userId từ JWT token
      │
2. [Service]  BookingService.CreateAsync(userId, request)
      │  Kiểm tra ngày check-in < check-out
      │  Kiểm tra phòng có tồn tại không
      │  Kiểm tra phòng có bị đặt trùng lịch không
      │  Tính TotalPrice = PricePerNight × số đêm
      │
3. [Model/DB] AppDbContext
      │  Lưu Booking mới vào bảng Bookings
      │  Trả dữ liệu về cho Service
      │
4. [Controller] Trả về HTTP 201 + BookingResponse (JSON)
```

### Vai trò của từng lớp

| Lớp | File | Làm gì |
|-----|------|--------|
| **Controller** | `Controllers/*.cs` | Nhận HTTP request → gọi Service → trả HTTP response |
| **DTO** | `DTOs/*.cs` | Định nghĩa cấu trúc JSON request/response. **Không** chứa logic |
| **Service** | `Services/*.cs` | Toàn bộ logic nghiệp vụ. **Không** biết gì về HTTP |
| **Model** | `Models/*.cs` | Ánh xạ sang bảng DB. **Không** chứa logic |
| **DbContext** | `Models/AppDbContext.cs` | Cầu nối EF Core ↔ SQL Server |

> 💡 **Quy tắc vàng:** Controller **không** được viết logic. Service **không** được trả `IActionResult`. Mỗi lớp chỉ làm đúng việc của mình.

---

## 🌐 Danh sách API

### 🔐 Auth

| Method | Endpoint | Mô tả | Cần đăng nhập? |
|--------|----------|-------|----------------|
| POST | `/api/auth/register` | Đăng ký tài khoản mới | Không |
| POST | `/api/auth/login` | Đăng nhập, nhận token | Không |

**Ví dụ đăng ký:**
```json
POST /api/auth/register
{
  "fullName": "Nguyễn Văn A",
  "email": "a@example.com",
  "password": "123456"
}
```

**Ví dụ đăng nhập:**
```json
POST /api/auth/login
{
  "email": "a@example.com",
  "password": "123456"
}
```
→ Nhận về `token`, dùng token này cho các API cần đăng nhập.

---

### 🏠 Rooms (Phòng)

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| GET | `/api/rooms` | Xem tất cả phòng | Tất cả |
| GET | `/api/rooms/{id}` | Xem chi tiết 1 phòng | Tất cả |
| POST | `/api/rooms` | Thêm phòng mới | Admin |
| PUT | `/api/rooms/{id}` | Sửa thông tin phòng | Admin |
| DELETE | `/api/rooms/{id}` | Xoá phòng | Admin |

**Ví dụ thêm phòng (Admin):**
```json
POST /api/rooms
{
  "name": "Phòng 102",
  "description": "Phòng đơn view biển",
  "pricePerNight": 450000,
  "capacity": 1,
  "imageUrl": ""
}
```

---

### 📅 Bookings (Đặt phòng)

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| GET | `/api/bookings` | Xem booking (Admin thấy tất cả, Customer thấy của mình) | Đăng nhập |
| GET | `/api/bookings/{id}` | Xem chi tiết booking | Đăng nhập |
| POST | `/api/bookings` | Đặt phòng | Đăng nhập |
| PUT | `/api/bookings/{id}/status` | Xác nhận hoặc từ chối | Admin |
| DELETE | `/api/bookings/{id}` | Huỷ booking | Đăng nhập |

**Ví dụ đặt phòng:**
```json
POST /api/bookings
{
  "roomId": 1,
  "checkIn": "2024-12-01T14:00:00",
  "checkOut": "2024-12-03T12:00:00",
  "note": "Cho tôi phòng tầng cao"
}
```

**Ví dụ duyệt booking (Admin):**
```json
PUT /api/bookings/1/status
{
  "status": "Confirmed"
}
```

> Các giá trị `status` hợp lệ: `Pending` | `Confirmed` | `Cancelled`

---

## 🔑 Cách sử dụng token

Sau khi đăng nhập, copy `token` trong response.  
Trên Swagger, click nút **Authorize 🔒** (góc trên bên phải), nhập:
```
Bearer <token của bạn>
```

---

## 👑 Tạo tài khoản Admin

Mặc định khi đăng ký, tài khoản có quyền `Customer`.  
Để đổi thành `Admin`, mở **SQL Server Management Studio (SSMS)** hoặc **Azure Data Studio**, kết nối vào DB và chạy:

```sql
USE RoomManagementDB;
UPDATE Users SET Role = 'Admin' WHERE Email = 'your@email.com';
```

---

## 🗄️ Dữ liệu mẫu

Khi chạy lần đầu, hệ thống tự tạo sẵn 3 phòng:

| Phòng | Mô tả | Giá/đêm |
|-------|-------|---------|
| Phòng 101 | Phòng đơn tiêu chuẩn | 300,000đ |
| Phòng 201 | Phòng đôi cao cấp | 500,000đ |
| Phòng 301 | Phòng VIP | 800,000đ |

---

## ⚠️ Lỗi thường gặp

**`command not found: dotnet`**
→ Chưa cài .NET SDK, xem lại bước Cài đặt môi trường.

**`No migrations have been applied`**  
→ Chạy `dotnet ef migrations add InitialCreate` trước khi `dotnet run`.

**`dotnet ef not found`**  
→ Cài EF CLI:
```bash
dotnet tool install --global dotnet-ef
```

**Lỗi kết nối SQL Server (Cannot open database / Login failed)**  
→ Kiểm tra lại connection string trong `appsettings.json`. Đảm bảo SQL Server đang chạy và thông tin đăng nhập đúng.

**`TrustServerCertificate` error**  
→ Thêm `TrustServerCertificate=True` vào cuối connection string.

**Port đã bị dùng**  
→ Đổi port trong `Properties/launchSettings.json` hoặc kill process đang dùng port đó.

---

## 👥 Phân công (gợi ý)

| Feature | File cần làm việc |
|---------|-----------------|
| Auth (đăng ký / đăng nhập) | `AuthController.cs`, `AuthService.cs` |
| Quản lý phòng | `RoomsController.cs`, `RoomService.cs` |
| Đặt phòng | `BookingsController.cs`, `BookingService.cs` |
| Cấu trúc DB | `Models/*.cs`, `AppDbContext.cs` |

---

## 📞 Liên hệ

Có vấn đề gì thì liên hệ nhóm trưởng hoặc tạo Issue trên GitHub.
