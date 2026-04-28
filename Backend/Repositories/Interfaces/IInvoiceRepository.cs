using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces
{
    public interface IInvoiceRepository : IGenericRepository<Invoice>
    {
        Task<Invoice?> GetByBookingIdAsync(string bookingId);
    }
}