using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations
{
    public class HotelService : IHotelService
    {
        private readonly IHotelRepository _repo;

        public HotelService(IHotelRepository repo) => _repo = repo;

        public async Task<IEnumerable<HotelDto>> GetAllApprovedAsync()
            => (await _repo.GetApprovedHotelsAsync()).Select(MapToDto);

        public async Task<HotelDetailDto?> GetDetailAsync(string id)
        {
            var h = await _repo.GetWithDetailsAsync(id);
            return h is null ? null : MapToDetailDto(h);
        }

        public async Task<IEnumerable<HotelDto>> GetByOwnerAsync(string ownerId)
            => (await _repo.GetByOwnerIdAsync(ownerId)).Select(MapToDto);

        public async Task<IEnumerable<HotelDto>> SearchAsync(string keyword)
            => (await _repo.SearchAsync(keyword)).Select(MapToDto);

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
            return MapToDto(await _repo.CreateAsync(entity));
        }

        public async Task<HotelDto?> UpdateAsync(string id, UpdateHotelDto dto)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity is null) return null;

            entity.Name = dto.Name ?? entity.Name;
            entity.Address = dto.Address ?? entity.Address;
            entity.Description = dto.Description ?? entity.Description;

            return MapToDto(await _repo.UpdateAsync(entity));
        }

        public async Task<bool> ApproveAsync(string id)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity is null) return false;
            entity.IsApproved = true;
            await _repo.UpdateAsync(entity);
            return true;
        }

        public Task<bool> DeleteAsync(string id) => _repo.DeleteAsync(id);

        private static HotelDto MapToDto(Hotel h) => new(
            h.Id, h.Name, h.Address, h.Description, h.IsApproved, h.OwnerId,
            h.Images.Select(i => new HotelImageDto(i.Id, i.Url, i.Caption)),
            h.Amenities.Select(a => new HotelAmenityDto(a.Id, a.Name, a.Description, a.Icon)));

        private static HotelDetailDto MapToDetailDto(Hotel h) => new(
            h.Id, h.Name, h.Address, h.Description, h.IsApproved,
            h.Owner is null ? null : new HotelOwnerDto(
                h.Owner.Id, h.Owner.AccountId, h.Owner.CompanyName, h.Owner.TaxCode, h.Owner.Phone),
            h.Rooms.Select(r => new RoomDto(
                r.Id, r.HotelId, r.RoomNumber, r.RoomType, r.Capacity,
                r.PricePerNight, r.Status, r.Description, r.IsSmokingAllowed,
                r.Images.Select(i => new RoomImageDto(i.Id, i.Url, i.Caption)))),
            h.Images.Select(i => new HotelImageDto(i.Id, i.Url, i.Caption)),
            h.Amenities.Select(a => new HotelAmenityDto(a.Id, a.Name, a.Description, a.Icon)),
            h.Reviews.Select(r => new ReviewDto(
                r.Id, r.HotelId, r.CustomerId, r.Customer?.Name, r.Rating, r.Comment, r.CreatedAt)),
            h.Reviews.Any() ? h.Reviews.Average(r => r.Rating ?? 0) : 0);
    }
}