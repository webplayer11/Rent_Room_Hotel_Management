using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces
{
    public interface IHotelService
    {
        Task<IEnumerable<HotelDto>> GetAllApprovedAsync();
        Task<HotelDetailDto?> GetDetailAsync(string id);
        Task<IEnumerable<HotelDto>> GetByOwnerAsync(string ownerId);
        Task<IEnumerable<HotelDto>> SearchAsync(string keyword);
        Task<HotelDto> CreateAsync(CreateHotelDto dto);
        Task<HotelDto?> UpdateAsync(string id, UpdateHotelDto dto);
        Task<bool> ApproveAsync(string id);
        Task<bool> DeleteAsync(string id);
    }
}