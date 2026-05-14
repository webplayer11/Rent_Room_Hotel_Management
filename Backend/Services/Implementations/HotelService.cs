using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations
{
    public class HotelService : IHotelService
    {
        private readonly IHotelRepository _repo;

        public HotelService(IHotelRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<HotelDto>> GetAllApprovedAsync()
        {
            var hotels = await _repo.GetApprovedHotelsAsync();
            return hotels.Select(MapToDto);
        }

        public async Task<HotelDetailDto?> GetDetailAsync(string id)
        {
            var hotel = await _repo.GetWithDetailsAsync(id);
            return hotel is null ? null : MapToDetailDto(hotel);
        }

        public async Task<IEnumerable<HotelDto>> GetByOwnerAsync(string ownerId)
        {
            var hotels = await _repo.GetByOwnerIdAsync(ownerId);
            return hotels.Select(MapToDto);
        }

        public async Task<IEnumerable<HotelDto>> SearchAsync(string keyword)
        {
            var hotels = await _repo.SearchAsync(keyword);
            return hotels.Select(MapToDto);
        }

        public async Task<HotelDto> CreateAsync(CreateHotelDto dto)
        {
            var entity = new Hotel
            {
                Id = dto.Id,
                Name = dto.Name,
                Address = dto.Address,
                Description = dto.Description,
                OwnerId = dto.OwnerId,
                IsApproved = false
            };

            var createdHotel = await _repo.CreateAsync(entity);

            return MapToDto(createdHotel);
        }

        public async Task<HotelDto?> UpdateAsync(string id, UpdateHotelDto dto)
        {
            var entity = await _repo.GetByIdAsync(id);

            if (entity is null)
            {
                return null;
            }

            entity.Name = dto.Name ?? entity.Name;
            entity.Address = dto.Address ?? entity.Address;
            entity.Description = dto.Description ?? entity.Description;

            var updatedHotel = await _repo.UpdateAsync(entity);

            return MapToDto(updatedHotel);
        }

        public async Task<bool> ApproveAsync(string id)
        {
            var entity = await _repo.GetByIdAsync(id);

            if (entity is null)
            {
                return false;
            }

            entity.IsApproved = true;

            await _repo.UpdateAsync(entity);

            return true;
        }

        public Task<bool> DeleteAsync(string id)
        {
            return _repo.DeleteAsync(id);
        }

        private static HotelDto MapToDto(Hotel hotel)
        {
            return new HotelDto(
                hotel.Id,
                hotel.Name,
                hotel.Address,
                hotel.Description,
                hotel.IsApproved,
                hotel.OwnerId,
                hotel.Images?.Select(image => new HotelImageDto(
                    image.Id,
                    image.Url,
                    image.Caption
                )) ?? Enumerable.Empty<HotelImageDto>(),
                hotel.Amenities?.Select(amenity => new HotelAmenityDto(
                    amenity.Id,
                    amenity.Name,
                    amenity.Description,
                    amenity.Icon
                )) ?? Enumerable.Empty<HotelAmenityDto>()
            );
        }

        private static HotelDetailDto MapToDetailDto(Hotel hotel)
        {
            return new HotelDetailDto(
                hotel.Id,
                hotel.Name,
                hotel.Address,
                hotel.Description,
                hotel.IsApproved,
                hotel.Owner is null
                    ? null
                    : new HotelOwnerDto(
                        hotel.Owner.Id,
                        hotel.Owner.CompanyName,
                        hotel.Owner.TaxCode,
                        hotel.Owner.Phone
                    ),
                hotel.Rooms?.Select(room => new RoomDto(
                    room.Id,
                    room.HotelId,
                    room.RoomNumber,
                    room.RoomType,
                    room.Capacity,
                    room.PricePerNight,
                    room.Status,
                    room.Description,
                    room.IsSmokingAllowed,
                    room.Images?.Select(image => new RoomImageDto(
                        image.Id,
                        image.Url,
                        image.Caption
                    )) ?? Enumerable.Empty<RoomImageDto>()
                )) ?? Enumerable.Empty<RoomDto>(),
                hotel.Images?.Select(image => new HotelImageDto(
                    image.Id,
                    image.Url,
                    image.Caption
                )) ?? Enumerable.Empty<HotelImageDto>(),
                hotel.Amenities?.Select(amenity => new HotelAmenityDto(
                    amenity.Id,
                    amenity.Name,
                    amenity.Description,
                    amenity.Icon
                )) ?? Enumerable.Empty<HotelAmenityDto>(),
                hotel.Reviews?.Select(review => new ReviewDto(
                    review.Id,
                    review.HotelId,
                    review.CustomerId,
                    null,
                    review.Rating,
                    review.Comment,
                    review.CreatedAt
                )) ?? Enumerable.Empty<ReviewDto>(),
                hotel.Reviews != null && hotel.Reviews.Any()
                    ? hotel.Reviews.Average(review => review.Rating ?? 0)
                    : 0
            );
        }
    }
}