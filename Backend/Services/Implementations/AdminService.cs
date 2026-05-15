using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RoomManagement.Data;
using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Services.Interfaces;
using RoomManagement.Utils;

namespace RoomManagement.Services.Implementations;

public class AdminService : IAdminService
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly RoleManager<IdentityRole> _roleManager;

    public AdminService(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration,
        RoleManager<IdentityRole> roleManager)
    {
        _context = context;
        _userManager = userManager;
        _configuration = configuration;
        _roleManager = roleManager;
    }
    private async Task EnsureRoleExistsAsync(string roleName)
    {
        if (!await _roleManager.RoleExistsAsync(roleName))
        {
            await _roleManager.CreateAsync(new IdentityRole(roleName));
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  HOST MANAGEMENT
    // ══════════════════════════════════════════════════════════════

    public async Task<IEnumerable<HostProfileDto>> GetPendingHostsAsync()
    {
        var hosts = await _context.HostProfiles
            .Include(h => h.User)
            .Where(h => h.Status == "Pending")
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return hosts.Select(MapHostToDto);
    }

    public async Task<IEnumerable<HostProfileDto>> GetApprovedHostsAsync()
    {
        var hosts = await _context.HostProfiles
            .Include(h => h.User)
            .Where(h => h.Status == "Approved")
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return hosts.Select(MapHostToDto);
    }

    public async Task<HostProfileDto?> GetHostProfileByIdAsync(string hostId)
    {
        var host = await _context.HostProfiles
            .Include(h => h.User)
            .FirstOrDefaultAsync(h => h.Id == hostId);

        if (host == null) return null;
        return MapHostToDto(host);
    }

    public async Task<bool> ApproveHostAsync(string hostId)
    {
        var host = await _context.HostProfiles.FindAsync(hostId);
        if (host == null) return false;

        host.Status = "Approved";
        host.IsVerified = true;
        host.RejectionReason = null;
        var user = await _userManager.FindByIdAsync(hostId);
        await EnsureRoleExistsAsync(AppRoles.Host);
        if (user == null) return false;
        await _userManager.AddToRoleAsync(user, AppRoles.Host);

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectHostAsync(string hostId, string reason)
    {
        var host = await _context.HostProfiles.FindAsync(hostId);
        if (host == null) return false;

        host.Status = "Rejected";
        host.IsVerified = false;
        host.RejectionReason = reason;

        await _context.SaveChangesAsync();
        return true;
    }

    // ══════════════════════════════════════════════════════════════
    //  HOTEL MANAGEMENT
    // ══════════════════════════════════════════════════════════════

    public async Task<IEnumerable<HotelDto>> GetPendingHotelsAsync()
    {
        var hotels = await _context.Hotels
            .Include(h => h.Host)
            .Include(h => h.Images)
            .Where(h => !h.IsApproved)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return hotels.Select(MapHotelToDto);
    }

    public async Task<IEnumerable<HotelDto>> GetApprovedHotelsAsync()
    {
        var hotels = await _context.Hotels
            .Include(h => h.Host)
            .Include(h => h.Images)
            .Where(h => h.IsApproved)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return hotels.Select(MapHotelToDto);
    }

    public async Task<HotelDto?> GetHotelByIdAdminAsync(string hotelId)
    {
        var hotel = await _context.Hotels
            .Include(h => h.Host)
            .Include(h => h.Images)
            .FirstOrDefaultAsync(h => h.Id == hotelId);

        if (hotel == null) return null;
        return MapHotelToDto(hotel);
    }

    public async Task<IEnumerable<HotelDto>> GetAllHotelsAdminAsync()
    {
        var hotels = await _context.Hotels
            .Include(h => h.Host)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return hotels.Select(MapHotelToDto);
    }

    public async Task<bool> ApproveHotelAsync(string hotelId)
    {
        var hotel = await _context.Hotels.FindAsync(hotelId);
        if (hotel == null) return false;

        hotel.IsApproved = true;
        hotel.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SuspendHotelAsync(string hotelId, string reason)
    {
        var hotel = await _context.Hotels.FindAsync(hotelId);
        if (hotel == null) return false;

        hotel.IsActive = false;
        hotel.SuspendedAt = DateTime.UtcNow;
        hotel.SuspendReason = reason;
        hotel.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UnsuspendHotelAsync(string hotelId)
    {
        var hotel = await _context.Hotels.FindAsync(hotelId);
        if (hotel == null) return false;

        hotel.IsActive = true;
        hotel.SuspendedAt = null;
        hotel.SuspendReason = null;
        hotel.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteHotelAsync(string hotelId)
    {
        var hotel = await _context.Hotels.FindAsync(hotelId);
        if (hotel == null) return false;

        _context.Hotels.Remove(hotel);
        await _context.SaveChangesAsync();
        return true;
    }

    // ══════════════════════════════════════════════════════════════
    //  STATISTICS
    // ══════════════════════════════════════════════════════════════

    public async Task<RevenueStatsDto> GetRevenueStatsAsync()
    {
        var commissionRate = _configuration.GetValue<double>("Commission:Rate", 0.10);

        var bookings = await _context.Bookings.ToListAsync();
        var completedBookings = bookings.Where(b => b.Status == "Completed").ToList();

        var totalRevenue = completedBookings.Sum(b => b.FinalPrice);
        var totalCommission = totalRevenue * (decimal)commissionRate;

        return new RevenueStatsDto
        {
            TotalRevenue = totalRevenue,
            TotalCommission = totalCommission,
            TotalBookings = bookings.Count,
            CompletedBookings = completedBookings.Count,
            PendingBookings = bookings.Count(b => b.Status == "Pending"),
            CancelledBookings = bookings.Count(b => b.Status == "Cancelled"),
            AverageBookingValue = completedBookings.Count > 0
                ? totalRevenue / completedBookings.Count
                : 0
        };
    }

    public async Task<GrowthStatsDto> GetGrowthStatsAsync()
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);

        var totalUsers = await _userManager.Users.CountAsync();
        var newUsersThisMonth = await _userManager.Users
            .CountAsync(u => u.CreatedAt >= startOfMonth);

        var totalHosts = await _context.HostProfiles.CountAsync();
        var totalHotels = await _context.Hotels.CountAsync();
        var approvedHotels = await _context.Hotels.CountAsync(h => h.IsApproved);

        var bookingsThisMonth = await _context.Bookings
            .Where(b => b.CreatedAt >= startOfMonth)
            .ToListAsync();

        // Monthly bookings (last 6 months)
        var sixMonthsAgo = now.AddMonths(-6);
        var recentBookings = await _context.Bookings
            .Where(b => b.CreatedAt >= sixMonthsAgo)
            .ToListAsync();

        var monthlyBookings = recentBookings
            .GroupBy(b => new { b.CreatedAt.Year, b.CreatedAt.Month })
            .Select(g => new MonthlyStatDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Count = g.Count(),
                Amount = g.Sum(b => b.FinalPrice)
            })
            .OrderBy(m => m.Year).ThenBy(m => m.Month)
            .ToList();

        return new GrowthStatsDto
        {
            TotalUsers = totalUsers,
            NewUsersThisMonth = newUsersThisMonth,
            TotalHosts = totalHosts,
            TotalHotels = totalHotels,
            ApprovedHotels = approvedHotels,
            TotalBookingsThisMonth = bookingsThisMonth.Count,
            CompletedBookingsThisMonth = bookingsThisMonth.Count(b => b.Status == "Completed"),
            MonthlyBookings = monthlyBookings,
            MonthlyRevenue = monthlyBookings // Same data, Amount field contains revenue
        };
    }

    // ── Mapping Helpers ──────────────────────────────────────────

    private static HostProfileDto MapHostToDto(HostProfile host)
    {
        return new HostProfileDto
        {
            Id = host.Id,
            CompanyName = host.CompanyName,
            TaxCode = host.TaxCode,
            BankAccount = host.BankAccount,
            BankName = host.BankName,
            IsVerified = host.IsVerified,
            BusinessLicenseUrl = host.BusinessLicenseUrls,
            Email = host.User?.Email,
            FullName = host.User?.FullName,
            PhoneNumber = host.User?.PhoneNumber
        };
    }

    private static HotelDto MapHotelToDto(Hotel hotel)
    {
        return new HotelDto
        {
            Id = hotel.Id,
            Name = hotel.Name,
            Description = hotel.Description,
            Address = hotel.Address,
            StarRating = hotel.StarRating,
            CheckInTime = hotel.CheckInTime,
            CheckOutTime = hotel.CheckOutTime,
            IsActive = hotel.IsActive,
            IsApproved = hotel.IsApproved,
            HostId = hotel.HostId,
            Latitude = hotel.Latitude,
            Longitude = hotel.Longitude,
            Images = hotel.Images?.Select(img => new HotelImageDto
            {
                Id = img.Id,
                Url = img.Url,
                Caption = img.Caption,
                IsPrimary = img.IsPrimary,
                SortOrder = img.SortOrder
            }).ToList() ?? new List<HotelImageDto>()
        };
    }
}
