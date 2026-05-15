using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations;

public class HotelService : IHotelService
{
    private readonly IHotelRepository _repository;

    public HotelService(IHotelRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<HotelDto>> GetAllAsync()
    {
        var hotels = await _repository.GetAllAsync();
        return hotels.Select(h => MapToDto(h));
    }

    public async Task<IEnumerable<HotelDto>> GetByHostIdAsync(string hostId)
    {
        var hotels = await _repository.GetByHostIdAsync(hostId);
        return hotels.Select(h => MapToDto(h));
    }

    public async Task<HotelDto?> GetByIdAsync(string id)
    {
        var hotel = await _repository.GetByIdAsync(id);
        if (hotel == null) return null;
        return MapToDto(hotel);
    }

    public async Task<HotelDto> CreateAsync(string hostId, CreateHotelDto dto)
    {
        var hotel = new Hotel
        {
            Name = dto.Name,
            Description = dto.Description,
            Address = dto.Address,
            StarRating = dto.StarRating,
            CheckInTime = dto.CheckInTime,
            CheckOutTime = dto.CheckOutTime,
            HostId = hostId,
            IsActive = true,
            IsApproved = false
        };

        var created = await _repository.CreateAsync(hotel);
        return MapToDto(created);
    }

    public async Task<HotelDto?> UpdateAsync(string hostId, string id, UpdateHotelDto dto)
    {
        var hotel = await _repository.GetByIdAsync(id);
        if (hotel == null || hotel.HostId != hostId) return null;

        hotel.Name = dto.Name;
        hotel.Description = dto.Description;
        hotel.Address = dto.Address;
        hotel.StarRating = dto.StarRating;
        hotel.CheckInTime = dto.CheckInTime;
        hotel.CheckOutTime = dto.CheckOutTime;
        hotel.IsActive = dto.IsActive;
        hotel.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(hotel);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(string hostId, string id)
    {
        var hotel = await _repository.GetByIdAsync(id);
        if (hotel == null || hotel.HostId != hostId) return false;

        return await _repository.DeleteAsync(id);
    }

    private static HotelDto MapToDto(Hotel hotel)
    {
        return new HotelDto
        {
            Id = hotel.Id,
            Name = hotel.Name,
            Description = hotel.Description,
            Address = hotel.Address,
            StarRating = hotel.StarRating,
            CheckInTime = hotel.CheckInTime,
            CheckOutTime = hotel.CheckOutTime,
            IsActive = hotel.IsActive,
            IsApproved = hotel.IsApproved,
            HostId = hotel.HostId,
            Latitude = hotel.Latitude,
            Longitude = hotel.Longitude,
            Images = hotel.Images?.Select(img => new HotelImageDto
            {
                Id = img.Id,
                Url = img.Url,
                Caption = img.Caption,
                IsPrimary = img.IsPrimary,
                SortOrder = img.SortOrder
            }).ToList() ?? new List<HotelImageDto>()
        };
    }
}
