using RoomManagement.DTOs;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IInvoiceRepository _repo;

        public InvoiceService(IInvoiceRepository repo) => _repo = repo;

        public async Task<InvoiceDto?> GetByIdAsync(string id)
        {
            var i = await _repo.GetByIdAsync(id);
            return i is null ? null : new InvoiceDto(i.Id, i.BookingId, i.TotalAmount, i.TaxAmount, i.IssuedAt);
        }

        public async Task<InvoiceDto?> GetByBookingAsync(string bookingId)
        {
            var i = await _repo.GetByBookingIdAsync(bookingId);
            return i is null ? null : new InvoiceDto(i.Id, i.BookingId, i.TotalAmount, i.TaxAmount, i.IssuedAt);
        }
    }
}