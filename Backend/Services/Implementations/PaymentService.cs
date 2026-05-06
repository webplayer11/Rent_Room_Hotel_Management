using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _repo;

        public PaymentService(IPaymentRepository repo) => _repo = repo;

        public async Task<IEnumerable<PaymentDto>> GetByBookingAsync(string bookingId)
            => (await _repo.GetByBookingIdAsync(bookingId)).Select(MapToDto);

        public async Task<PaymentDto> CreateAsync(CreatePaymentDto dto)
        {
            var entity = new Payment
            {
                Id = dto.Id,
                BookingId = dto.BookingId,
                Amount = dto.Amount,
                Method = dto.Method,
                Status = "Pending",
                TransactionId = dto.TransactionId,
                PaidAt = DateTime.UtcNow
            };
            return MapToDto(await _repo.CreateAsync(entity));
        }

        public async Task<PaymentDto?> GetByTransactionIdAsync(string transactionId)
        {
            var p = await _repo.GetByTransactionIdAsync(transactionId);
            return p is null ? null : MapToDto(p);
        }

        private static PaymentDto MapToDto(Payment p) => new(
            p.Id, p.BookingId, p.Amount, p.Method,
            p.Status, p.TransactionId, p.PaidAt, p.RefundedAt);
    }
}