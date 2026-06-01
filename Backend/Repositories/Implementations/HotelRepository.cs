using Microsoft.EntityFrameworkCore;
using RoomManagement.Data;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.DTOs;

namespace RoomManagement.Repositories.Implementations;

public class HotelRepository : IHotelRepository
{
    private readonly AppDbContext _context;

    public HotelRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Hotel>> GetAllAsync()
    {
        return await _context.Hotels
            .Include(h => h.Images)
            .Include(h => h.Amenities)
            .Where(h => h.IsApproved && h.IsActive)
            .ToListAsync();
    }

    public async Task<IEnumerable<Hotel>> GetByHostIdAsync(string hostId)
    {
        return await _context.Hotels
            .Include(h => h.Images)
            .Include(h => h.Amenities)
            .Where(h => h.HostId == hostId)
            .ToListAsync();
    }

    public async Task<Hotel?> GetByIdAsync(string id)
    {
        return await _context.Hotels
            .Include(h => h.Images)
            .Include(h => h.Amenities)
            .FirstOrDefaultAsync(h => h.Id == id);
    }

    public async Task<Hotel> CreateAsync(Hotel hotel)
    {
        hotel.Id = Guid.NewGuid().ToString();
        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();
        return hotel;
    }

    public async Task<Hotel> UpdateAsync(Hotel hotel)
    {
        _context.Hotels.Update(hotel);
        await _context.SaveChangesAsync();
        return hotel;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var hotel = await GetByIdAsync(id);
        if (hotel == null) return false;

        // Lấy tất cả roomId thuộc khách sạn này
        var roomIds = await _context.Rooms.Where(r => r.HotelId == id).Select(r => r.Id).ToListAsync();

        if (roomIds.Any())
        {
            // Lấy tất cả booking của các phòng này
            var bookings = await _context.Bookings
                .Where(b => roomIds.Contains(b.RoomId))
                .ToListAsync();

            var bookingIds = bookings.Select(b => b.Id).ToList();

            if (bookingIds.Any())
            {
                // Set null BookingId trên Reviews (Review→Booking là SetNull) để tránh FK khi xóa Booking
                // Không xóa Reviews ở đây — cascade từ Hotel sẽ xử lý sau
                var reviews = await _context.Reviews
                    .Where(r => r.BookingId != null && bookingIds.Contains(r.BookingId!))
                    .ToListAsync();
                foreach (var rv in reviews)
                    rv.BookingId = null;

                // Xóa Invoices (1-1 Booking, Cascade nhưng Booking chưa bị xóa nên phải xóa tường minh)
                var invoices = await _context.Invoices
                    .Where(i => bookingIds.Contains(i.BookingId))
                    .ToListAsync();
                _context.Invoices.RemoveRange(invoices);

                // Xóa Payments liên quan
                var payments = await _context.Payments
                    .Where(p => bookingIds.Contains(p.BookingId))
                    .ToListAsync();
                _context.Payments.RemoveRange(payments);

                // Xóa tất cả Bookings
                _context.Bookings.RemoveRange(bookings);
            }

            await _context.SaveChangesAsync();
        }

        // Xóa tất cả các Related Entities của Hotel để tránh DbUpdateException do Restrict FK
        var hotelImages = await _context.HotelImages.Where(hi => hi.HotelId == id).ToListAsync();
        _context.HotelImages.RemoveRange(hotelImages);

        var favorites = await _context.Favorites.Where(f => f.HotelId == id).ToListAsync();
        _context.Favorites.RemoveRange(favorites);

        var revenueReports = await _context.RevenueReports.Where(r => r.HotelId == id).ToListAsync();
        _context.RevenueReports.RemoveRange(revenueReports);

        var hotelRequests = await _context.HotelRequests.Where(hr => hr.HotelId == id).ToListAsync();
        _context.HotelRequests.RemoveRange(hotelRequests);

        var vouchers = await _context.Vouchers.Where(v => v.HotelId == id).ToListAsync();
        _context.Vouchers.RemoveRange(vouchers);

        var allHotelReviews = await _context.Reviews.Where(r => r.HotelId == id).ToListAsync();
        _context.Reviews.RemoveRange(allHotelReviews);

        var rooms = await _context.Rooms.Where(r => r.HotelId == id).ToListAsync();
        foreach (var r in rooms)
        {
            var roomImages = await _context.RoomImages.Where(ri => ri.RoomId == r.Id).ToListAsync();
            _context.RoomImages.RemoveRange(roomImages);
        }
        _context.Rooms.RemoveRange(rooms);

        // Xóa Hotel
        _context.Hotels.Remove(hotel);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Hotel>> SearchHotelsAsync(SearchHotelRequestDto request)
    {
        var query = _context.Hotels
            .Include(h => h.Images)
            .Include(h => h.Amenities)
            .Include(h => h.Rooms)
                .ThenInclude(r => r.Images)
            .Include(h => h.Rooms)
                .ThenInclude(r => r.Bookings)
            .Where(h => h.IsActive && h.IsApproved)
            .AsQueryable();

        // Nếu không có toạ độ (Latitude, Longitude), thì mới tìm kiếm text (Contains)
        // Còn nếu đã có toạ độ, ta sẽ tìm kiếm theo bán kính thay vì text matching để trả về tất cả khách sạn trong bán kính.
        if (!string.IsNullOrWhiteSpace(request.Location) && (!request.Latitude.HasValue || !request.Longitude.HasValue))
        {
            var locationLower = request.Location.ToLower();
            query = query.Where(h => (h.Name != null && h.Name.ToLower().Contains(locationLower)) ||
                                     (h.Address != null && h.Address.ToLower().Contains(locationLower)));
        }

        if (request.Latitude.HasValue && request.Longitude.HasValue)
        {
            double radius = request.RadiusKm ?? 50.0;
            double latDelta = radius / 111.32;
            double lngDelta = radius / (111.32 * Math.Cos(request.Latitude.Value * Math.PI / 180.0));
            double minLat = request.Latitude.Value - latDelta;
            double maxLat = request.Latitude.Value + latDelta;
            double minLng = request.Longitude.Value - lngDelta;
            double maxLng = request.Longitude.Value + lngDelta;

            query = query.Where(h => h.Latitude.HasValue && h.Longitude.HasValue &&
                                     h.Latitude >= minLat && h.Latitude <= maxLat &&
                                     h.Longitude >= minLng && h.Longitude <= maxLng);
        }

        var hotels = await query.ToListAsync();

        if (request.Latitude.HasValue && request.Longitude.HasValue)
        {
            double radius = request.RadiusKm ?? 50.0;
            hotels = hotels.Where(h => CalculateDistance(request.Latitude.Value, request.Longitude.Value, h.Latitude!.Value, h.Longitude!.Value) <= radius).ToList();
        }

        var validHotels = new List<Hotel>();

        foreach (var hotel in hotels)
        {
            var availableRooms = new List<Room>();

            foreach (var room in hotel.Rooms.Where(r => r.IsActive && (string.IsNullOrEmpty(r.Status) || r.Status == "Available")))
            {
                bool isRoomAvailable = true;
                if (request.CheckInDate.HasValue && request.CheckOutDate.HasValue)
                {
                    bool hasOverlap = room.Bookings.Any(b =>
                        b.Status != "Cancelled" && b.Status != "Failed" &&
                        b.CheckInDate < request.CheckOutDate.Value &&
                        b.CheckOutDate > request.CheckInDate.Value);

                    if (hasOverlap)
                    {
                        isRoomAvailable = false;
                    }
                }

                if (isRoomAvailable)
                {
                    availableRooms.Add(room);
                }
            }

            if (availableRooms.Count >= request.RoomCount)
            {
                // Sắp xếp các phòng trống theo sức chứa giảm dần
                // và lấy ra số lượng phòng bằng với số lượng phòng khách yêu cầu (request.RoomCount)
                // Tính tổng sức chứa của các phòng này xem có đủ cho số lượng khách (request.GuestCount) hay không
                var maxCapacityForRequestedRooms = availableRooms
                    .OrderByDescending(r => r.Capacity)
                    .Take(request.RoomCount)
                    .Sum(r => r.Capacity);

                if (maxCapacityForRequestedRooms >= request.GuestCount)
                {
                    hotel.Rooms = availableRooms;
                    validHotels.Add(hotel);
                }
            }
        }

        return validHotels;
    }
//công thức Haversine — dùng để tính khoảng cách đường chim bay giữa 2 điểm trên bề mặt Trái Đất
    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return 6371 * c;
    }

    private double ToRadians(double angle)
    {
        return Math.PI * angle / 180.0;
    }
}
