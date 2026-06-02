using Microsoft.EntityFrameworkCore;
using RoomManagement.Data;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations;

public class HostRevenueService : IHostRevenueService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public HostRevenueService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<HostRevenueDto> GetHostRevenueAsync(string hostId)
    {
        var commissionRate = _configuration.GetValue<double>("Commission:Rate", 0.10);

        // Lấy tất cả hotel của host
        var hotels = await _context.Hotels
            .Where(h => h.HostId == hostId)
            .ToListAsync();
        var hotelIds = hotels.Select(h => h.Id).ToList();

        // Lấy tất cả booking completed thuộc rooms của các hotel
        var bookings = await _context.Bookings
            .Include(b => b.Room)
                .ThenInclude(r => r!.Hotel)
            .Where(b => b.Room != null
                && b.Room.HotelId != null
                && hotelIds.Contains(b.Room.HotelId))
            .ToListAsync();

        var completedBookings = bookings.Where(b => b.Status == "Completed" || b.Status == "CheckedOut").ToList();
        var totalRevenue = completedBookings.Sum(b => b.FinalPrice);
        var commissionAmount = totalRevenue * (decimal)commissionRate;

        // Phân theo hotel
        var byHotel = hotels.Select(hotel => 
        {
            var hotelBookings = completedBookings.Where(b => b.Room?.HotelId == hotel.Id).ToList();
            var hotelRevenue = hotelBookings.Sum(b => b.FinalPrice);
            var hotelCommission = hotelRevenue * (decimal)commissionRate;
            return new HotelRevenueItemDto
            {
                HotelId = hotel.Id,
                HotelName = hotel.Name,
                Revenue = hotelRevenue,
                Commission = hotelCommission,
                NetRevenue = hotelRevenue - hotelCommission,
                BookingCount = hotelBookings.Count
            };
        }).ToList();

        return new HostRevenueDto
        {
            TotalRevenue = totalRevenue,
            CommissionRate = (decimal)commissionRate,
            CommissionAmount = commissionAmount,
            NetRevenue = totalRevenue - commissionAmount,
            TotalBookings = bookings.Count,
            CompletedBookings = completedBookings.Count,
            ByHotel = byHotel
        };
    }

    public async Task<HotelRevenueDetailDto?> GetHotelRevenueAsync(string hostId, string hotelId)
    {
        var commissionRate = _configuration.GetValue<double>("Commission:Rate", 0.10);

        // Verify host owns this hotel
        var hotel = await _context.Hotels.FindAsync(hotelId);
        if (hotel == null || hotel.HostId != hostId) return null;

        var allBookings = await _context.Bookings
            .Include(b => b.Room)
            .Where(b => b.Room != null && b.Room.HotelId == hotelId)
            .ToListAsync();

        var completedBookings = allBookings.Where(b => b.Status == "Completed" || b.Status == "CheckedOut").ToList();
        var cancelledBookings = allBookings.Where(b => b.Status == "Cancelled" || b.Status == "Rejected").ToList();

        var totalRevenue = completedBookings.Sum(b => b.FinalPrice);
        var totalCommission = totalRevenue * (decimal)commissionRate;

        // by month
        var byMonth = completedBookings
            .Where(b => b.UpdatedAt.HasValue)
            .GroupBy(b => new { b.UpdatedAt!.Value.Year, b.UpdatedAt!.Value.Month })
            .Select(g => new RevenueByTimeDto
            {
                Period = $"{g.Key.Month:D2}/{g.Key.Year}",
                Revenue = g.Sum(b => b.FinalPrice)
            })
            .OrderByDescending(x => x.Period)
            .ToList();

        // by year
        var byYear = completedBookings
            .Where(b => b.UpdatedAt.HasValue)
            .GroupBy(b => b.UpdatedAt!.Value.Year)
            .Select(g => new RevenueByTimeDto
            {
                Period = g.Key.ToString(),
                Revenue = g.Sum(b => b.FinalPrice)
            })
            .OrderByDescending(x => x.Period)
            .ToList();

        return new HotelRevenueDetailDto
        {
            HotelId = hotelId,
            HotelName = hotel.Name,
            TotalRevenue = totalRevenue,
            Commission = totalCommission,
            NetRevenue = totalRevenue - totalCommission,
            TotalBookings = allBookings.Count,
            CompletedBookings = completedBookings.Count,
            CancelledBookings = cancelledBookings.Count,
            ByMonth = byMonth,
            ByYear = byYear
        };
    }
    
    //Lấy dữ liệu cho dashboard
    public async Task<DashboardStatsDto> GetDashboardStatsAsync(string hostId, string? hotelId = null)
    {
        var hotels = await _context.Hotels
            .Where(h => h.HostId == hostId && (string.IsNullOrEmpty(hotelId) || h.Id == hotelId))
            .Select(h => h.Id)
            .ToListAsync();

        var today = DateTime.UtcNow.Date;
        var thisMonth = today.Month;
        var thisYear = today.Year;

        var bookingsToday = await _context.Bookings
            .Include(b => b.Room)
            .Where(b => b.Room != null && b.Room.HotelId != null && hotels.Contains(b.Room.HotelId)
                        && b.CreatedAt.Date == today)
            .CountAsync();

        var revenueThisMonth = await _context.Bookings
            .Include(b => b.Room)
            .Where(b => b.Room != null && b.Room.HotelId != null && hotels.Contains(b.Room.HotelId)
                        && (b.Status == "Completed" || b.Status == "CheckedOut")
                        && b.UpdatedAt != null && b.UpdatedAt.Value.Month == thisMonth && b.UpdatedAt.Value.Year == thisYear)
            .SumAsync(b => b.FinalPrice);

        var rooms = await _context.Rooms
            .Where(r => r.HotelId != null && hotels.Contains(r.HotelId) && r.IsActive)
            .ToListAsync();

        var totalRooms = rooms.Count;
        var occupiedRooms = rooms.Count(r => r.Status == "Occupied");
        var emptyRooms = rooms.Count(r => r.Status == "Available" || r.Status == null);

        return new DashboardStatsDto
        {
            BookingsToday = bookingsToday,
            RevenueThisMonth = revenueThisMonth,
            EmptyRooms = emptyRooms,
            OccupiedRooms = occupiedRooms,
        };
    }
}
