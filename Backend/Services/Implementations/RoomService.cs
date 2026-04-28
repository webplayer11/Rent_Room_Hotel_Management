using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations
{
    public class RoomService : IRoomService
    {
        private readonly IRoomRepository _repo;

        public RoomService(IRoomRepository repo) => _repo = repo;

        public async Task<IEnumerable<RoomDto>> GetByHotelAsync(string hotelId)
            => (await _repo.GetByHotelIdAsync(hotelId)).Select(MapToDto);

        public async Task<RoomDto?> GetByIdAsync(string id)
        {
            var r = await _repo.GetWithImagesAsync(id);
            return r is null ? null : MapToDto(r);
        }

        public async Task<IEnumerable<RoomDto>> GetAvailableAsync(
            string hotelId, DateOnly startDate, DateOnly endDate)
            => (await _repo.GetAvailableRoomsAsync(hotelId, startDate, endDate)).Select(MapToDto);

        public async Task<RoomDto> CreateAsync(CreateRoomDto dto)
        {
            var entity = new Room
            {
                Id = dto.Id,
                HotelId = dto.HotelId,
                RoomNumber = dto.RoomNumber,
                RoomType = dto.RoomType,
                Capacity = dto.Capacity,
                PricePerNight = dto.PricePerNight ?? 0,
                Status = "Available",
                Description = dto.Description,
                IsSmokingAllowed = dto.IsSmokingAllowed
            };
            return MapToDto(await _repo.CreateAsync(entity));
        }

        public async Task<RoomDto?> UpdateAsync(string id, UpdateRoomDto dto)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity is null) return null;

            entity.RoomType = dto.RoomType ?? entity.RoomType;
            entity.Capacity = dto.Capacity ?? entity.Capacity;
            entity.PricePerNight = dto.PricePerNight ?? entity.PricePerNight;
            entity.Status = dto.Status ?? entity.Status;
            entity.Description = dto.Description ?? entity.Description;
            entity.IsSmokingAllowed = dto.IsSmokingAllowed ?? entity.IsSmokingAllowed;

            return MapToDto(await _repo.UpdateAsync(entity));
        }

        public Task<bool> DeleteAsync(string id) => _repo.DeleteAsync(id);

        private static RoomDto MapToDto(Room r) => new(
            r.Id, r.HotelId, r.RoomNumber, r.RoomType, r.Capacity,
            r.PricePerNight, r.Status, r.Description, r.IsSmokingAllowed,
            r.Images.Select(i => new RoomImageDto(i.Id, i.Url, i.Caption)));
    }
}