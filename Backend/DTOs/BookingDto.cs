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
        int? GuestCount,
        string? SpecialRequest,
        DateTime? CreatedAt
    );

    public record BookingDetailDto(
        string Id,
        RoomDto? Room,
        string? ReservationNumber,
        DateOnly? StartDate,
        DateOnly? EndDate,
        int? DurationInDays,
        decimal? TotalPrice,
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

}