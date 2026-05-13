using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces
{
    public interface IBookingService
    {
        Task<IEnumerable<BookingDto>> GetByCustomerAsync(string customerId);
        Task<BookingDetailDto?> GetDetailAsync(string id);
        Task<BookingDto> CreateAsync(CreateBookingDto dto);

    }
}