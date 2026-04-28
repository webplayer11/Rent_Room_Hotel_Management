using RoomManagement.DTOs;

namespace RoomManagement.DTOs
{
    public record WishlistDto(string Id, string? CustomerId, HotelDto? Hotel);

    public record CreateWishlistDto(string Id, string CustomerId, string HotelId);
}