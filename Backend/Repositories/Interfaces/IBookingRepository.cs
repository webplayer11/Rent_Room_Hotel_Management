using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces;

public interface IBookingRepository
{
    Task<IEnumerable<Booking>> GetByUserIdAsync(string userId);
    Task<IEnumerable<Booking>> GetByHostIdAsync(string hostId);
    Task<Booking?> GetByIdAsync(string id);
    Task<Booking> CreateAsync(Booking booking);
    Task<Booking> UpdateAsync(Booking booking);
}
