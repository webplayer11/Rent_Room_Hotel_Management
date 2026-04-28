namespace RoomManagement.DTOs
{
    public record VoucherDto(
        string Id,
        string? Code,
        string? Type,
        decimal? DiscountValue,
        decimal? MinOrderAmount,
        DateOnly? StartDate,
        DateOnly? EndDate,
        int? UsageLimit
    );
}