using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces;

public interface IAdminService
{
    // ── Host Management ──────────────────────────
    Task<IEnumerable<HostProfileDto>> GetPendingHostsAsync();
    Task<IEnumerable<HostProfileDto>> GetApprovedHostsAsync();
    Task<HostProfileDto?> GetHostProfileByIdAsync(string hostId);
    Task<bool> ApproveHostAsync(string hostId);
    Task<bool> RejectHostAsync(string hostId, string reason);

    // ── Hotel Management ─────────────────────────
    Task<IEnumerable<HotelDto>> GetPendingHotelsAsync();
    Task<IEnumerable<HotelDto>> GetApprovedHotelsAsync();
    Task<HotelDto?> GetHotelByIdAdminAsync(string hotelId);
    Task<IEnumerable<HotelDto>> GetAllHotelsAdminAsync();
    Task<bool> ApproveHotelAsync(string hotelId);
    Task<bool> SuspendHotelAsync(string hotelId, string reason);
    Task<bool> UnsuspendHotelAsync(string hotelId);
    Task<bool> DeleteHotelAsync(string hotelId);

    // ── Statistics ────────────────────────────────
    Task<RevenueStatsDto> GetRevenueStatsAsync();
    Task<GrowthStatsDto> GetGrowthStatsAsync();
}
