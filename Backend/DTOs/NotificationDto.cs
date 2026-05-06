namespace RoomManagement.DTOs
{
    public record NotificationDto(
        string Id,
        string? CustomerId,
        string? Type,
        string? Message,
        DateTime? SentAt,
        bool? IsRead
    );
}