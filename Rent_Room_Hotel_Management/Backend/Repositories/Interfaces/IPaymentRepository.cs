using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces
{
    public interface IPaymentRepository : IGenericRepository<Payment>
    {
        Task<IEnumerable<Payment>> GetByBookingIdAsync(string bookingId);
        Task<Payment?> GetByTransactionIdAsync(string transactionId);
    }
}