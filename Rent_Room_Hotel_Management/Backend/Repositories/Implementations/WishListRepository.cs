using Microsoft.EntityFrameworkCore;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Data;

namespace RoomManagement.Repositories.Implementations
{
    public class WishlistRepository : GenericRepository<Wishlist>, IWishlistRepository
    {
        public WishlistRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Wishlist>> GetByCustomerIdAsync(string customerId)
            => await _dbSet.AsNoTracking()
                           .Where(w => w.CustomerId == customerId)
                           .Include(w => w.Hotel).ThenInclude(h => h!.Images)
                           .ToListAsync();

        public async Task<bool> ExistsAsync(string customerId, string hotelId)
            => await _dbSet.AnyAsync(w => w.CustomerId == customerId && w.HotelId == hotelId);

        public async Task<bool> RemoveAsync(string customerId, string hotelId)
        {
            var item = await _dbSet.FirstOrDefaultAsync(
                w => w.CustomerId == customerId && w.HotelId == hotelId);
            if (item is null) return false;
            _dbSet.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}