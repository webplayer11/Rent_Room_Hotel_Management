namespace RoomManagement.DTOs
{
    public record HotelDeleteRequestDto(
        string Id,
        string HotelId,
        string HotelName,
        string OwnerId,
        string OwnerName,
        string Reason,
        string Status,
        string? AdminNote,
        DateTime CreatedAt,
        DateTime? UpdatedAt
    );

    public record CreateHotelDeleteRequestDto(
        string HotelId,
        string Reason
    );

    public record ReviewHotelDeleteRequestDto(
        string Decision, // Approved, Rejected
        string? AdminNote
    );
}
