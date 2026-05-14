using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces;

public interface IRoomRepository
{
    Task<IEnumerable<Room>> GetByHotelIdAsync(string hotelId);
    Task<Room?> GetByIdAsync(string id);
    Task<Room> CreateAsync(Room room);
    Task<Room> UpdateAsync(Room room);
    Task<bool> DeleteAsync(string id);
}
