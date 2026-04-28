using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces
{
    public interface IRoomService
    {
        Task<IEnumerable<RoomDto>> GetByHotelAsync(string hotelId);
        Task<RoomDto?> GetByIdAsync(string id);
        Task<IEnumerable<RoomDto>> GetAvailableAsync(string hotelId, DateOnly startDate, DateOnly endDate);
        Task<RoomDto> CreateAsync(CreateRoomDto dto);
        Task<RoomDto?> UpdateAsync(string id, UpdateRoomDto dto);
        Task<bool> DeleteAsync(string id);
    }
}