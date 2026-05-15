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
        var hotelIds = await _context.Hotels
            .Where(h => h.HostId == hostId)
            .Select(h => h.Id)
            .ToListAsync();

        // Lấy tất cả booking completed thuộc rooms của các hotel
        var bookings = await _context.Bookings
            .Include(b => b.Room)
                .ThenInclude(r => r!.Hotel)
            .Where(b => b.Room != null
                && b.Room.HotelId != null
                && hotelIds.Contains(b.Room.HotelId))
            .ToListAsync();

        var completedBookings = bookings.Where(b => b.Status == "Completed").ToList();
        var totalRevenue = completedBookings.Sum(b => b.FinalPrice);
        var commissionAmount = totalRevenue * (decimal)commissionRate;

        // Phân theo hotel
        var byHotel = completedBookings
            .GroupBy(b => b.Room!.HotelId!)
            .Select(g =>
            {
                var hotelRevenue = g.Sum(b => b.FinalPrice);
                var hotelCommission = hotelRevenue * (decimal)commissionRate;
                return new HotelRevenueItemDto
                {
                    HotelId = g.Key,
                    HotelName = g.First().Room?.Hotel?.Name,
                    Revenue = hotelRevenue,
                    Commission = hotelCommission,
                    NetRevenue = hotelRevenue - hotelCommission,
                    BookingCount = g.Count()
                };
            })
            .ToList();

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

    public async Task<HotelRevenueItemDto?> GetHotelRevenueAsync(string hostId, string hotelId)
    {
        var commissionRate = _configuration.GetValue<double>("Commission:Rate", 0.10);

        // Verify host owns this hotel
        var hotel = await _context.Hotels.FindAsync(hotelId);
        if (hotel == null || hotel.HostId != hostId) return null;

        var completedBookings = await _context.Bookings
            .Include(b => b.Room)
            .Where(b => b.Room != null
                && b.Room.HotelId == hotelId
                && b.Status == "Completed")
            .ToListAsync();

        var hotelRevenue = completedBookings.Sum(b => b.FinalPrice);
        var hotelCommission = hotelRevenue * (decimal)commissionRate;

        return new HotelRevenueItemDto
        {
            HotelId = hotelId,
            HotelName = hotel.Name,
            Revenue = hotelRevenue,
            Commission = hotelCommission,
            NetRevenue = hotelRevenue - hotelCommission,
            BookingCount = completedBookings.Count
        };
    }
}
