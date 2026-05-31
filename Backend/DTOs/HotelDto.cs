namespace RoomManagement.DTOs;

public class AmenityDto
{
    public string Id { get; set; } = default!;
    public string? Name { get; set; }
    public string? Icon { get; set; }
    public string? Category { get; set; }
}

public class HotelImageDto
{
    public string Id { get; set; } = default!;
    public string? Url { get; set; }
    public string? Caption { get; set; }
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}

public class HotelDto
{
    public string Id { get; set; } = default!;
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Address { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int? StarRating { get; set; }
    public string? CheckInTime { get; set; }
    public string? CheckOutTime { get; set; }
    public bool IsActive { get; set; }
    public bool IsApproved { get; set; }
    public DateTime? SuspendedAt { get; set; }
    public string? SuspendReason { get; set; }
    public string HostId { get; set; } = default!;
    public List<HotelImageDto> Images { get; set; } = new();
    public List<AmenityDto> Amenities { get; set; } = new();
}

public class CreateHotelDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Address { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int? StarRating { get; set; }
    public string? CheckInTime { get; set; }
    public string? CheckOutTime { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<string> Amenities { get; set; } = new();
}

public class UpdateHotelDto : CreateHotelDto
{
    public bool IsActive { get; set; } = true;
}

public class SearchHotelRequestDto
{
    public string? Location { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public double? RadiusKm { get; set; } = 10.0;
    public DateOnly? CheckInDate { get; set; }
    public DateOnly? CheckOutDate { get; set; }
    public int RoomCount { get; set; } = 1;
    public int GuestCount { get; set; } = 1;
}

public class SearchHotelResponseDto : HotelDto
{
    public List<RoomDto> AvailableRooms { get; set; } = new();
    public bool IsFavorited { get; set; }
}
