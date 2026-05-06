namespace RoomManagement.DTOs
{
    public record PaymentDto(
        string Id,
        string? BookingId,
        decimal? Amount,
        string? Method,
        string? Status,
        string? TransactionId,
        DateTime? PaidAt,
        DateTime? RefundedAt
    );

    public record CreatePaymentDto(
        string Id,
        string BookingId,
        decimal Amount,
        string Method,
        string? TransactionId
    );
}