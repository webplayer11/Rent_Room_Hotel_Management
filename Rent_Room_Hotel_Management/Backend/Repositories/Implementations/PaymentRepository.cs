using Microsoft.EntityFrameworkCore;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Data;

namespace RoomManagement.Repositories.Implementations
{
    public class PaymentRepository : GenericRepository<Payment>, IPaymentRepository
    {
        public PaymentRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Payment>> GetByBookingIdAsync(string bookingId)
            => await _dbSet.AsNoTracking()
                           .Where(p => p.BookingId == bookingId)
                           .ToListAsync();

        public async Task<Payment?> GetByTransactionIdAsync(string transactionId)
            => await _dbSet.AsNoTracking()
                           .FirstOrDefaultAsync(p => p.TransactionId == transactionId);
    }
}