namespace RoomManagement.DTOs
{
    public record AccountDto(
        string Id,
        string? Email,
        string? Status,
        string? Role
    );
}