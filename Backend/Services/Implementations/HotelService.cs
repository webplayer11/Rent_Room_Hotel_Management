using AutoMapper;
using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations;

public class HotelService : IHotelService
{
    private readonly IHotelRepository _repository;
    private readonly IMapper _mapper;

    public HotelService(IHotelRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<HotelDto>> GetAllAsync()
    {
        var hotels = await _repository.GetAllAsync();
        return _mapper.Map<IEnumerable<HotelDto>>(hotels);
    }

    public async Task<IEnumerable<HotelDto>> GetByHostIdAsync(string hostId)
    {
        var hotels = await _repository.GetByHostIdAsync(hostId);
        return _mapper.Map<IEnumerable<HotelDto>>(hotels);
    }

    public async Task<HotelDto?> GetByIdAsync(string id)
    {
        var hotel = await _repository.GetByIdAsync(id);
        if (hotel == null) return null;
        return _mapper.Map<HotelDto>(hotel);
    }

    public async Task<HotelDto> CreateAsync(string hostId, CreateHotelDto dto)
    {
        var hotel = new Hotel
        {
            Name = dto.Name,
            Description = dto.Description,
            Address = dto.Address,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            StarRating = dto.StarRating,
            CheckInTime = dto.CheckInTime,
            CheckOutTime = dto.CheckOutTime,
            HostId = hostId,
            IsActive = true,
            IsApproved = false
        };

        var created = await _repository.CreateAsync(hotel);
        return _mapper.Map<HotelDto>(created);
    }

    public async Task<HotelDto?> UpdateAsync(string hostId, string id, UpdateHotelDto dto)
    {
        var hotel = await _repository.GetByIdAsync(id);
        if (hotel == null || hotel.HostId != hostId) return null;

        hotel.Name = dto.Name;
        hotel.Description = dto.Description;
        hotel.Address = dto.Address;
        if (dto.Latitude.HasValue) hotel.Latitude = dto.Latitude;
        if (dto.Longitude.HasValue) hotel.Longitude = dto.Longitude;
        hotel.StarRating = dto.StarRating;
        hotel.CheckInTime = dto.CheckInTime;
        hotel.CheckOutTime = dto.CheckOutTime;
        hotel.IsActive = dto.IsActive;
        hotel.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(hotel);
        return _mapper.Map<HotelDto>(updated);
    }

    public async Task<bool> DeleteAsync(string hostId, string id)
    {
        var hotel = await _repository.GetByIdAsync(id);
        if (hotel == null || hotel.HostId != hostId) return false;

        return await _repository.DeleteAsync(id);
    }

    public async Task<IEnumerable<SearchHotelResponseDto>> SearchAsync(SearchHotelRequestDto request)
    {
        var hotels = await _repository.SearchHotelsAsync(request);
        return _mapper.Map<IEnumerable<SearchHotelResponseDto>>(hotels);
    }
}
