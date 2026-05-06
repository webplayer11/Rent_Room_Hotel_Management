using Microsoft.EntityFrameworkCore;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Data;

namespace RoomManagement.Repositories.Implementations
{
    public class RoomRepository : GenericRepository<Room>, IRoomRepository
    {
        public RoomRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Room>> GetByHotelIdAsync(string hotelId)
            => await _dbSet.AsNoTracking()
                           .Where(r => r.HotelId == hotelId)
                           .Include(r => r.Images)
                           .ToListAsync();

        public async Task<Room?> GetWithImagesAsync(string id)
            => await _dbSet.AsNoTracking()
                           .Include(r => r.Images)
                           .FirstOrDefaultAsync(r => r.Id == id);

        public async Task<IEnumerable<Room>> GetAvailableRoomsAsync(
            string hotelId, DateOnly startDate, DateOnly endDate)
        {
            var bookedRoomIds = await _context.Bookings
                .Where(b => b.RoomId != null &&
                            b.Status != "Cancelled" &&
                            b.StartDate < endDate &&
                            b.EndDate > startDate)
                .Select(b => b.RoomId!)
                .Distinct()
                .ToListAsync();

            return await _dbSet.AsNoTracking()
                               .Where(r => r.HotelId == hotelId &&
                                           r.Status == "Available" &&
                                           !bookedRoomIds.Contains(r.Id))
                               .Include(r => r.Images)
                               .ToListAsync();
        }
    }
}