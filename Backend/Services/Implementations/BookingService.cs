using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IRoomRepository _roomRepository;

    public BookingService(IBookingRepository bookingRepository, IRoomRepository roomRepository)
    {
        _bookingRepository = bookingRepository;
        _roomRepository = roomRepository;
    }

    public async Task<IEnumerable<BookingDto>> GetMyBookingsAsync(string userId)
    {
        var bookings = await _bookingRepository.GetByUserIdAsync(userId);
        return bookings.Select(MapToDto);
    }

    public async Task<IEnumerable<BookingDto>> GetHostBookingsAsync(string hostId)
    {
        var bookings = await _bookingRepository.GetByHostIdAsync(hostId);
        return bookings.Select(MapToDto);
    }

    public async Task<BookingDto?> GetByIdAsync(string id)
    {
        var booking = await _bookingRepository.GetByIdAsync(id);
        return booking == null ? null : MapToDto(booking);
    }

    public async Task<BookingDto?> CreateBookingAsync(string userId, CreateBookingDto dto)
    {
        var room = await _roomRepository.GetByIdAsync(dto.RoomId);
        if (room == null || room.Status != "Available") return null;

        int nights = (dto.CheckOutDate.DayNumber - dto.CheckInDate.DayNumber);
        if (nights <= 0) return null;

        var booking = new Booking
        {
            UserId = userId,
            RoomId = dto.RoomId,
            VoucherId = dto.VoucherId,
            BookingCode = GenerateBookingCode(),
            CheckInDate = dto.CheckInDate,
            CheckOutDate = dto.CheckOutDate,
            NumberOfNights = nights,
            GuestCount = dto.GuestCount,
            UnitPrice = room.PricePerNight,
            TotalPrice = room.PricePerNight * nights,
            DiscountAmount = 0, // Placeholder for voucher calculation
            FinalPrice = room.PricePerNight * nights, // Minus discount
            SpecialRequest = dto.SpecialRequest,
            Status = "Pending"
        };

        var created = await _bookingRepository.CreateAsync(booking);
        return MapToDto(created);
    }

    public async Task<BookingDto?> UpdateBookingStatusAsync(string hostId, string bookingId, UpdateBookingStatusDto dto)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null) return null;

        // Verify host owns this booking's room
        if (booking.Room.Hotel?.HostId != hostId) return null;

        booking.Status = dto.Status;
        if (!string.IsNullOrEmpty(dto.CancellationReason))
        {
            booking.CancellationReason = dto.CancellationReason;
        }

        booking.UpdatedAt = DateTime.UtcNow;

        var updated = await _bookingRepository.UpdateAsync(booking);
        return MapToDto(updated);
    }

    private static BookingDto MapToDto(Booking booking)
    {
        return new BookingDto
        {
            Id = booking.Id,
            UserId = booking.UserId,
            RoomId = booking.RoomId,
            VoucherId = booking.VoucherId,
            BookingCode = booking.BookingCode,
            CheckInDate = booking.CheckInDate,
            CheckOutDate = booking.CheckOutDate,
            NumberOfNights = booking.NumberOfNights,
            GuestCount = booking.GuestCount,
            UnitPrice = booking.UnitPrice,
            TotalPrice = booking.TotalPrice,
            DiscountAmount = booking.DiscountAmount,
            FinalPrice = booking.FinalPrice,
            SpecialRequest = booking.SpecialRequest,
            Status = booking.Status
        };
    }

    private string GenerateBookingCode()
    {
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var stringChars = new char[8];
        var random = new Random();

        for (int i = 0; i < stringChars.Length; i++)
        {
            stringChars[i] = chars[random.Next(chars.Length)];
        }

        return new string(stringChars);
    }
}
