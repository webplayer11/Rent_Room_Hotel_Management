namespace RoomManagement.DTOs;

public class BookingDto
{
    public string Id { get; set; } = default!;
    public string UserId { get; set; } = default!;
    public string RoomId { get; set; } = default!;
    public string? VoucherId { get; set; }
    public string BookingCode { get; set; } = default!;
    public DateOnly CheckInDate { get; set; }
    public DateOnly CheckOutDate { get; set; }
    public int NumberOfNights { get; set; }
    public int GuestCount { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal FinalPrice { get; set; }
    public string? SpecialRequest { get; set; }
    public string Status { get; set; } = "Pending";
}

public class CreateBookingDto
{
    public string RoomId { get; set; } = default!;
    public string? VoucherId { get; set; }
    public DateOnly CheckInDate { get; set; }
    public DateOnly CheckOutDate { get; set; }
    public int GuestCount { get; set; }
    public string? SpecialRequest { get; set; }
}

public class UpdateBookingStatusDto
{
    public string Status { get; set; } = default!; // Confirmed, CheckedIn, Completed, Cancelled
    public string? CancellationReason { get; set; }
}
