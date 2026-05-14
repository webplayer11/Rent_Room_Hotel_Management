using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces;

public interface IHostProfileService
{
    Task<HostProfileDto?> GetProfileAsync(string userId);
    Task<HostProfileDto?> UpdateProfileAsync(string userId, UpdateHostProfileDto dto);
    Task<IEnumerable<HostProfileDto>> GetHostsByStatusAsync(bool isVerified);
    Task<bool> ApproveHostAsync(string hostId);
}
