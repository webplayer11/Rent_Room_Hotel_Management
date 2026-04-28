using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces
{
    public interface IWishlistRepository : IGenericRepository<Wishlist>
    {
        Task<IEnumerable<Wishlist>> GetByCustomerIdAsync(string customerId);
        Task<bool> ExistsAsync(string customerId, string hotelId);
        Task<bool> RemoveAsync(string customerId, string hotelId);
    }
}
