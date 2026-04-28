using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces
{
    public interface IHotelRepository : IGenericRepository<Hotel>
    {
        Task<IEnumerable<Hotel>> GetApprovedHotelsAsync();
        Task<Hotel?> GetWithDetailsAsync(string id);
        Task<IEnumerable<Hotel>> GetByOwnerIdAsync(string ownerId);
        Task<IEnumerable<Hotel>> SearchAsync(string keyword);
    }
}