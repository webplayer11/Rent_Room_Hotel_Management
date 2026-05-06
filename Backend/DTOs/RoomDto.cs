namespace RoomManagement.DTOs
{
    public record RoomDto(
        string Id,
        string? HotelId,
        string? RoomNumber,
        string? RoomType,
        int? Capacity,
        decimal? PricePerNight,
        string? Status,
        string? Description,
        bool? IsSmokingAllowed,
        IEnumerable<RoomImageDto>? Images
    );

    public record CreateRoomDto(
        string Id,
        string HotelId,
        string? RoomNumber,
        string? RoomType,
        int? Capacity,
        decimal? PricePerNight,
        string? Description,
        bool? IsSmokingAllowed
    );

    public record UpdateRoomDto(
        string? RoomType,
        int? Capacity,
        decimal? PricePerNight,
        string? Status,
        string? Description,
        bool? IsSmokingAllowed
    );

    public record RoomImageDto(string Id, string? Url, string? Caption);
}