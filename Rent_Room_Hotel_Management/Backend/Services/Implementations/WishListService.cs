using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations
{
    public class WishlistService : IWishlistService
    {
        private readonly IWishlistRepository _repo;

        public WishlistService(IWishlistRepository repo) => _repo = repo;

        public async Task<IEnumerable<WishlistDto>> GetByCustomerAsync(string customerId)
        {
            var list = await _repo.GetByCustomerIdAsync(customerId);
            return list.Select(w => new WishlistDto(
                w.Id, w.CustomerId,
                w.Hotel is null ? null : new HotelDto(
                    w.Hotel.Id, w.Hotel.Name, w.Hotel.Address, w.Hotel.Description,
                    w.Hotel.IsApproved, w.Hotel.OwnerId,
                    w.Hotel.Images.Select(i => new HotelImageDto(i.Id, i.Url, i.Caption)),
                    Enumerable.Empty<HotelAmenityDto>())));
        }

        public async Task<WishlistDto> AddAsync(CreateWishlistDto dto)
        {
            var entity = new Wishlist
            {
                Id = dto.Id,
                CustomerId = dto.CustomerId,
                HotelId = dto.HotelId
            };
            var created = await _repo.CreateAsync(entity);
            return new WishlistDto(created.Id, created.CustomerId, null);
        }

        public Task<bool> RemoveAsync(string customerId, string hotelId)
            => _repo.RemoveAsync(customerId, hotelId);

        public Task<bool> ExistsAsync(string customerId, string hotelId)
            => _repo.ExistsAsync(customerId, hotelId);
    }
}