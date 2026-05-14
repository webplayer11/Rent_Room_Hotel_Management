using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations;

public class RoomService : IRoomService
{
    private readonly IRoomRepository _roomRepository;
    private readonly IHotelRepository _hotelRepository;

    public RoomService(IRoomRepository roomRepository, IHotelRepository hotelRepository)
    {
        _roomRepository = roomRepository;
        _hotelRepository = hotelRepository;
    }

    public async Task<IEnumerable<RoomDto>> GetByHotelIdAsync(string hotelId)
    {
        var rooms = await _roomRepository.GetByHotelIdAsync(hotelId);
        return rooms.Select(MapToDto);
    }

    public async Task<RoomDto?> GetByIdAsync(string id)
    {
        var room = await _roomRepository.GetByIdAsync(id);
        return room != null ? MapToDto(room) : null;
    }

    public async Task<RoomDto?> CreateAsync(string hostId, CreateRoomDto dto)
    {
        var hotel = await _hotelRepository.GetByIdAsync(dto.HotelId);
        if (hotel == null || hotel.HostId != hostId) return null;

        var room = new Room
        {
            HotelId = dto.HotelId,
            RoomNumber = dto.RoomNumber,
            RoomType = dto.RoomType,
            Description = dto.Description,
            Capacity = dto.Capacity,
            BedCount = dto.BedCount,
            BedType = dto.BedType,
            PricePerNight = dto.PricePerNight,
            DiscountPrice = dto.DiscountPrice,
            RoomSize = dto.RoomSize,
            IsSmokingAllowed = dto.IsSmokingAllowed,
            Status = "Available",
            IsActive = true
        };

        var created = await _roomRepository.CreateAsync(room);
        return MapToDto(created);
    }

    public async Task<RoomDto?> UpdateAsync(string hostId, string id, CreateRoomDto dto)
    {
        var room = await _roomRepository.GetByIdAsync(id);
        if (room == null) return null;

        var hotel = await _hotelRepository.GetByIdAsync(room.HotelId!);
        if (hotel == null || hotel.HostId != hostId) return null;

        room.RoomNumber = dto.RoomNumber;
        room.RoomType = dto.RoomType;
        room.Description = dto.Description;
        room.Capacity = dto.Capacity;
        room.BedCount = dto.BedCount;
        room.BedType = dto.BedType;
        room.PricePerNight = dto.PricePerNight;
        room.DiscountPrice = dto.DiscountPrice;
        room.RoomSize = dto.RoomSize;
        room.IsSmokingAllowed = dto.IsSmokingAllowed;

        var updated = await _roomRepository.UpdateAsync(room);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(string hostId, string id)
    {
        var room = await _roomRepository.GetByIdAsync(id);
        if (room == null) return false;

        var hotel = await _hotelRepository.GetByIdAsync(room.HotelId!);
        if (hotel == null || hotel.HostId != hostId) return false;

        return await _roomRepository.DeleteAsync(id);
    }

    private static RoomDto MapToDto(Room room)
    {
        return new RoomDto
        {
            Id = room.Id,
            HotelId = room.HotelId,
            RoomNumber = room.RoomNumber,
            RoomType = room.RoomType,
            Description = room.Description,
            Capacity = room.Capacity,
            BedCount = room.BedCount,
            BedType = room.BedType,
            PricePerNight = room.PricePerNight,
            DiscountPrice = room.DiscountPrice,
            RoomSize = room.RoomSize,
            Status = room.Status,
            IsSmokingAllowed = room.IsSmokingAllowed,
            IsActive = room.IsActive
        };
    }
}
