using RoomManagement.DTOs;

namespace RoomManagement.DTOs
{
    public record HotelDto(
        string Id,
        string? Name,
        string? Address,
        string? Description,
        bool? IsApproved,
        string? OwnerId,
        IEnumerable<HotelImageDto>? Images,
        IEnumerable<HotelAmenityDto>? Amenities
    );

    public record HotelDetailDto(
        string Id,
        string? Name,
        string? Address,
        string? Description,
        bool? IsApproved,
        HotelOwnerDto? Owner,
        IEnumerable<RoomDto>? Rooms,
        IEnumerable<HotelImageDto>? Images,
        IEnumerable<HotelAmenityDto>? Amenities,
        IEnumerable<ReviewDto>? Reviews,
        double AverageRating
    );

    public record CreateHotelDto(
        string Id,
        string? Name,
        string? Address,
        string? Description,
        string OwnerId
    );

    public record UpdateHotelDto(
        string? Name,
        string? Address,
        string? Description
    );

    public record HotelImageDto(string Id, string? Url, string? Caption);

    public record HotelAmenityDto(string Id, string? Name, string? Description, string? Icon);
}