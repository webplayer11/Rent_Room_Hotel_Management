using Microsoft.EntityFrameworkCore;
using RoomManagement.Data;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;

namespace RoomManagement.Repositories.Implementations
{
    public class HotelDeleteRequestRepository : GenericRepository<HotelDeleteRequest>, IHotelDeleteRequestRepository
    {
        public HotelDeleteRequestRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<HotelDeleteRequest>> GetByOwnerIdAsync(string ownerId)
            => await _dbSet.AsNoTracking()
                           .Where(r => r.OwnerId == ownerId)
                           .Include(r => r.Hotel)
                           .OrderByDescending(r => r.CreatedAt)
                           .ToListAsync();

        public async Task<IEnumerable<HotelDeleteRequest>> GetByStatusAsync(string status)
            => await _dbSet.AsNoTracking()
                           .Where(r => r.Status == status)
                           .Include(r => r.Hotel)
                           .Include(r => r.Owner)
                           .OrderByDescending(r => r.CreatedAt)
                           .ToListAsync();

        public async Task<HotelDeleteRequest?> GetWithDetailsAsync(string id)
            => await _dbSet.AsNoTracking()
                           .Include(r => r.Hotel)
                           .Include(r => r.Owner)
                           .FirstOrDefaultAsync(r => r.Id == id);

        public async Task<int> CountPendingAsync()
            => await _dbSet.CountAsync(r => r.Status == "Pending");

        public async Task<bool> HasPendingRequestAsync(string hotelId)
            => await _dbSet.AnyAsync(r => r.HotelId == hotelId && r.Status == "Pending");
    }
}
