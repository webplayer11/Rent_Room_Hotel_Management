using Microsoft.EntityFrameworkCore;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Data;

namespace RoomManagement.Repositories.Implementations
{
    public class HotelRepository : GenericRepository<Hotel>, IHotelRepository
    {
        public HotelRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Hotel>> GetApprovedHotelsAsync()
            => await _dbSet.AsNoTracking()
                           .Where(h => h.IsApproved == true)
                           .Include(h => h.Images)
                           .Include(h => h.Amenities)
                           .ToListAsync();

        public async Task<Hotel?> GetWithDetailsAsync(string id)
            => await _dbSet.AsNoTracking()
                           .Include(h => h.Owner)
                           .Include(h => h.Rooms).ThenInclude(r => r.Images)
                           .Include(h => h.Images)
                           .Include(h => h.Amenities)
                           .Include(h => h.Reviews).ThenInclude(r => r.Customer)
                           .FirstOrDefaultAsync(h => h.Id == id);

        public async Task<IEnumerable<Hotel>> GetByOwnerIdAsync(string ownerId)
            => await _dbSet.AsNoTracking()
                           .Where(h => h.OwnerId == ownerId)
                           .Include(h => h.Images)
                           .ToListAsync();

        public async Task<IEnumerable<Hotel>> SearchAsync(string keyword)
        {
            var lower = keyword.ToLower();
            return await _dbSet.AsNoTracking()
                               .Where(h => h.IsApproved == true &&
                                           (h.Name!.ToLower().Contains(lower) ||
                                            h.Address!.ToLower().Contains(lower)))
                               .Include(h => h.Images)
                               .Include(h => h.Amenities)
                               .ToListAsync();
        }
    }
}