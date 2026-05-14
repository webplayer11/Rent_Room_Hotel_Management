using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces
{
    public interface IBookingRepository : IGenericRepository<Booking>
    {
        Task<IEnumerable<Booking>> GetByCustomerIdAsync(string customerId);
        Task<IEnumerable<Booking>> GetByRoomIdAsync(string roomId);
        Task<Booking?> GetWithDetailsAsync(string id);
        Task<bool> HasOverlappingBookingAsync(string roomId, DateOnly startDate, DateOnly endDate, string? excludeBookingId = null);
        Task<bool> HasActiveBookingByHotelAsync(string hotelId);
    }
}