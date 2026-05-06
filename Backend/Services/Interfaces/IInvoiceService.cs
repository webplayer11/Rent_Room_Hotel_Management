using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces
{
    public interface IInvoiceService
    {
        Task<InvoiceDto?> GetByIdAsync(string id);
        Task<InvoiceDto?> GetByBookingAsync(string bookingId);
    }
}