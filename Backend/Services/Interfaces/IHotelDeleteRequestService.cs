using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces
{
    public interface IHotelDeleteRequestService
    {
        Task<HotelDeleteRequestDto> CreateAsync(string ownerId, CreateHotelDeleteRequestDto dto);
        Task<IEnumerable<HotelDeleteRequestDto>> GetByOwnerAsync(string ownerId);
        Task<IEnumerable<HotelDeleteRequestDto>> GetAllAsync(string? status);
        Task<HotelDeleteRequestDto?> GetByIdAsync(string id);
        Task<int> GetPendingCountAsync();
        Task<bool> ReviewAsync(string id, ReviewHotelDeleteRequestDto dto);
        Task<bool> CancelAsync(string id, string ownerId);
    }
}
