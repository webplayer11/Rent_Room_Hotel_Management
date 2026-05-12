using Microsoft.EntityFrameworkCore;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Data;

namespace RoomManagement.Repositories.Implementations
{
    public class BookingRepository : GenericRepository<Booking>, IBookingRepository
    {
        public BookingRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Booking>> GetByCustomerIdAsync(string customerId)
            => await _dbSet.AsNoTracking()
                           .Where(b => b.CustomerId == customerId)
                           .Include(b => b.RoomNav).ThenInclude(r => r!.Hotel)
                           .OrderByDescending(b => b.CreatedAt)
                           .ToListAsync();

        public async Task<IEnumerable<Booking>> GetByRoomIdAsync(string roomId)
            => await _dbSet.AsNoTracking()
                           .Where(b => b.RoomId == roomId)
                           .ToListAsync();

        public async Task<Booking?> GetWithDetailsAsync(string id)
            => await _dbSet.AsNoTracking()
                           .Include(b => b.CustomerNav)
                           .Include(b => b.RoomNav).ThenInclude(r => r!.Hotel)
                           .Include(b => b.Payments)
                           .Include(b => b.Invoices)
                           .FirstOrDefaultAsync(b => b.Id == id);

        public async Task<bool> HasOverlappingBookingAsync(
            string roomId, DateOnly startDate, DateOnly endDate,
            string? excludeBookingId = null)
            => await _dbSet.AnyAsync(b =>
                b.RoomId == roomId &&
                b.Id != excludeBookingId &&
                b.StartDate < endDate &&
                b.EndDate > startDate);
    }
}