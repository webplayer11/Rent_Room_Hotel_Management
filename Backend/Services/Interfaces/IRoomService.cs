using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces;

public interface IRoomService
{
    Task<IEnumerable<RoomDto>> GetByHotelIdAsync(string hotelId, DateOnly? checkIn = null, DateOnly? checkOut = null);
    Task<RoomDto?> GetByIdAsync(string id);
    Task<RoomDto?> CreateAsync(string hostId, CreateRoomDto dto);
    Task<RoomDto?> UpdateAsync(string hostId, string id, CreateRoomDto dto);
    Task<bool> DeleteAsync(string hostId, string id);
}
