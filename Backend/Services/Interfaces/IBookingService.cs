using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces;

public interface IBookingService
{
    Task<IEnumerable<BookingDto>> GetMyBookingsAsync(string userId);
    Task<IEnumerable<BookingDto>> GetHostBookingsAsync(string hostId);
    Task<BookingDto?> GetByIdAsync(string id);
    Task<BookingDto?> CreateBookingAsync(string userId, CreateBookingDto dto);
    Task<BookingDto?> UpdateBookingStatusAsync(string hostId, string bookingId, UpdateBookingStatusDto dto);
}
