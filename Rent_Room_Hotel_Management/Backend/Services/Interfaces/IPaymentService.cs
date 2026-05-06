using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<IEnumerable<PaymentDto>> GetByBookingAsync(string bookingId);
        Task<PaymentDto> CreateAsync(CreatePaymentDto dto);
        Task<PaymentDto?> GetByTransactionIdAsync(string transactionId);
    }
}