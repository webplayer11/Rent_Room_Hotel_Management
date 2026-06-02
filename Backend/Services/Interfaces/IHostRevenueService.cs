using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces;

public interface IHostRevenueService
{
    Task<HostRevenueDto> GetHostRevenueAsync(string hostId);
    Task<HotelRevenueDetailDto?> GetHotelRevenueAsync(string hostId, string hotelId);
    Task<DashboardStatsDto> GetDashboardStatsAsync(string hostId, string? hotelId = null);
}
