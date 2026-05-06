using Microsoft.EntityFrameworkCore;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Data;

namespace RoomManagement.Repositories.Implementations
{
    public class InvoiceRepository : GenericRepository<Invoice>, IInvoiceRepository
    {
        public InvoiceRepository(AppDbContext context) : base(context) { }

        public async Task<Invoice?> GetByBookingIdAsync(string bookingId)
            => await _dbSet.AsNoTracking()
                           .FirstOrDefaultAsync(i => i.BookingId == bookingId);
    }
}