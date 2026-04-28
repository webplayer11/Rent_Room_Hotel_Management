using RoomManagement.DTOs;

namespace RoomManagement.DTOs
{
    public record BookingDto(
        string Id,
        string? CustomerId,
        string? RoomId,
        string? ReservationNumber,
        DateOnly? StartDate,
        DateOnly? EndDate,
        int? DurationInDays,
        decimal? TotalPrice,
        string? Status,
        int? GuestCount,
        string? SpecialRequest,
        DateTime? CreatedAt
    );

    public record BookingDetailDto(
        string Id,
        CustomerDto? Customer,
        RoomDto? Room,
        string? ReservationNumber,
        DateOnly? StartDate,
        DateOnly? EndDate,
        int? DurationInDays,
        decimal? TotalPrice,
        string? Status,
        int? GuestCount,
        string? SpecialRequest,
        DateTime? CreatedAt,
        IEnumerable<PaymentDto>? Payments
    );

    public record CreateBookingDto(
        string Id,
        string CustomerId,
        string RoomId,
        DateOnly StartDate,
        DateOnly EndDate,
        int? GuestCount,
        string? SpecialRequest
    );

    public record UpdateBookingStatusDto(string Status);
}