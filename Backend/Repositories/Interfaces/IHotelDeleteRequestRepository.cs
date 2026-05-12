using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces
{
    public interface IHotelDeleteRequestRepository : IGenericRepository<HotelDeleteRequest>
    {
        Task<IEnumerable<HotelDeleteRequest>> GetByOwnerIdAsync(string ownerId);
        Task<IEnumerable<HotelDeleteRequest>> GetByStatusAsync(string status);
        Task<HotelDeleteRequest?> GetWithDetailsAsync(string id);
        Task<int> CountPendingAsync();
        Task<bool> HasPendingRequestAsync(string hotelId);
    }
}
