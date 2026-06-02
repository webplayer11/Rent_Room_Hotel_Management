using AutoMapper;
using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;
using RoomManagement.Data;
using Microsoft.EntityFrameworkCore;

namespace RoomManagement.Services.Implementations;

public class RoomService : IRoomService
{
    private readonly IRoomRepository _roomRepository;
    private readonly IHotelRepository _hotelRepository;
    private readonly IMapper _mapper;
    private readonly AppDbContext _context;

    public RoomService(IRoomRepository roomRepository, IHotelRepository hotelRepository, IMapper mapper, AppDbContext context)
    {
        _roomRepository = roomRepository;
        _hotelRepository = hotelRepository;
        _mapper = mapper;
        _context = context;
    }

    public async Task<IEnumerable<RoomDto>> GetByHotelIdAsync(string hotelId, DateOnly? checkIn = null, DateOnly? checkOut = null)
    {
        var rooms = await _roomRepository.GetByHotelIdAsync(hotelId);
        var dtos = _mapper.Map<List<RoomDto>>(rooms);

        var checkInDate = checkIn ?? DateOnly.FromDateTime(DateTime.Today);
        var checkOutDate = checkOut ?? checkInDate.AddDays(1);

        foreach (var dto in dtos)
        {
            bool hasConflict = await _context.Bookings.AnyAsync(b =>
                b.RoomId == dto.Id &&
                b.Status != "Cancelled" &&
                b.Status != "Completed" &&
                b.Status != "CheckedOut" &&
                b.CheckInDate < checkOutDate &&
                b.CheckOutDate > checkInDate);
            
            if (hasConflict)
            {
                dto.Status = "SoldOut";
            }
        }

        return dtos;
    }

    public async Task<RoomDto?> GetByIdAsync(string id)
    {
        var room = await _roomRepository.GetByIdAsync(id);
        return room != null ? _mapper.Map<RoomDto>(room) : null;
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
            Status = dto.Status ?? "Available",
            IsActive = true
        };

        if (dto.RoomAmenities != null && dto.RoomAmenities.Any())
        {
            var amenityNames = dto.RoomAmenities.Select(a => a.Trim().ToLower()).Distinct().ToList();
            var existingAmenities = await _context.RoomAmenities
                .Where(a => a.Name != null && amenityNames.Contains(a.Name.ToLower()))
                .ToListAsync();

            var existingNames = existingAmenities.Select(a => a.Name?.ToLower()).ToList();
            var newNames = amenityNames.Except(existingNames).ToList();

            foreach (var name in newNames)
            {
                var newAmenity = new RoomAmenity
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = dto.RoomAmenities.First(a => a.Trim().Equals(name, StringComparison.OrdinalIgnoreCase)).Trim()
                };
                _context.RoomAmenities.Add(newAmenity);
                existingAmenities.Add(newAmenity);
            }

            room.RoomAmenities = existingAmenities;
        }

        var created = await _roomRepository.CreateAsync(room);
        return _mapper.Map<RoomDto>(created);
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
        if (!string.IsNullOrEmpty(dto.Status))
        {
            room.Status = dto.Status;
        }

        if (dto.RoomAmenities != null)
        {
            var amenityNames = dto.RoomAmenities.Select(a => a.Trim().ToLower()).Distinct().ToList();
            var existingAmenities = await _context.RoomAmenities
                .Where(a => a.Name != null && amenityNames.Contains(a.Name.ToLower()))
                .ToListAsync();

            var existingNames = existingAmenities.Select(a => a.Name?.ToLower()).ToList();
            var newNames = amenityNames.Except(existingNames).ToList();

            foreach (var name in newNames)
            {
                var newAmenity = new RoomAmenity
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = dto.RoomAmenities.First(a => a.Trim().Equals(name, StringComparison.OrdinalIgnoreCase)).Trim()
                };
                _context.RoomAmenities.Add(newAmenity);
                existingAmenities.Add(newAmenity);
            }

            room.RoomAmenities.Clear();
            foreach (var amenity in existingAmenities)
            {
                room.RoomAmenities.Add(amenity);
            }
        }

        var updated = await _roomRepository.UpdateAsync(room);
        return _mapper.Map<RoomDto>(updated);
    }

    public async Task<bool> DeleteAsync(string hostId, string id)
    {
        var room = await _roomRepository.GetByIdAsync(id);
        if (room == null) return false;

        var hotel = await _hotelRepository.GetByIdAsync(room.HotelId!);
        if (hotel == null || hotel.HostId != hostId) return false;

        return await _roomRepository.DeleteAsync(id);
    }
}
