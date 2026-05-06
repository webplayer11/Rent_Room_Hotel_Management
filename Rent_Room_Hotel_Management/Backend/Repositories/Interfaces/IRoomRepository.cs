using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces
{
    public interface IRoomRepository : IGenericRepository<Room>
    {
        Task<IEnumerable<Room>> GetByHotelIdAsync(string hotelId);
        Task<Room?> GetWithImagesAsync(string id);
        Task<IEnumerable<Room>> GetAvailableRoomsAsync(string hotelId, DateOnly startDate, DateOnly endDate);
    }
}