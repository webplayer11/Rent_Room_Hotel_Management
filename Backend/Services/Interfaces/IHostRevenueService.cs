using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces;

public interface IHostRevenueService
{
    Task<HostRevenueDto> GetHostRevenueAsync(string hostId);
    Task<HotelRevenueItemDto?> GetHotelRevenueAsync(string hostId, string hotelId);
}
