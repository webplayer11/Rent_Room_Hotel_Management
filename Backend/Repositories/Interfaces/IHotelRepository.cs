using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces;

public interface IHotelRepository
{
    Task<IEnumerable<Hotel>> GetAllAsync();
    Task<IEnumerable<Hotel>> GetByHostIdAsync(string hostId);
    Task<Hotel?> GetByIdAsync(string id);
    Task<Hotel> CreateAsync(Hotel hotel);
    Task<Hotel> UpdateAsync(Hotel hotel);
    Task<bool> DeleteAsync(string id);
}
