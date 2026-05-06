namespace RoomManagement.DTOs
{
    public record InvoiceDto(
        string Id,
        string? BookingId,
        decimal? TotalAmount,
        decimal? TaxAmount,
        DateTime? IssuedAt
    );
}