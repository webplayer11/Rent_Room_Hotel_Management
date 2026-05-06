using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces
{
    public interface IWishlistService
    {
        Task<IEnumerable<WishlistDto>> GetByCustomerAsync(string customerId);
        Task<WishlistDto> AddAsync(CreateWishlistDto dto);
        Task<bool> RemoveAsync(string customerId, string hotelId);
        Task<bool> ExistsAsync(string customerId, string hotelId);
    }
}