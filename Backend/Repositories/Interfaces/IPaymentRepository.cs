using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces;

public interface IPaymentRepository
{
    Task<IEnumerable<Payment>> GetByBookingIdAsync(string bookingId);
    Task<Payment?> GetByIdAsync(string id);
    Task<Payment> CreateAsync(Payment payment);
    Task<Payment> UpdateAsync(Payment payment);
    
    Task<bool> UpdateStatusAsync(string paymentBuild);
    
    
}
