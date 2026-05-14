using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces;

public interface IHotelService
{
    Task<IEnumerable<HotelDto>> GetAllAsync();
    Task<IEnumerable<HotelDto>> GetByHostIdAsync(string hostId);
    Task<HotelDto?> GetByIdAsync(string id);
    Task<HotelDto> CreateAsync(string hostId, CreateHotelDto dto);
    Task<HotelDto?> UpdateAsync(string hostId, string id, UpdateHotelDto dto);
    Task<bool> DeleteAsync(string hostId, string id);
}
