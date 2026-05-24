using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces;

public interface IFavoriteService
{
    Task<bool> ToggleFavoriteAsync(string userId, string hotelId);
    Task<IEnumerable<SearchHotelResponseDto>> GetFavoritesAsync(string userId);
    Task<bool> IsFavoritedAsync(string userId, string hotelId);
}
