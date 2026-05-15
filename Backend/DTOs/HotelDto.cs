namespace RoomManagement.DTOs;

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
    public string HostId { get; set; } = default!;
    public List<HotelImageDto> Images { get; set; } = new();
}

public class CreateHotelDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Address { get; set; }
    public int? StarRating { get; set; }
    public string? CheckInTime { get; set; }
    public string? CheckOutTime { get; set; }
}

public class UpdateHotelDto : CreateHotelDto
{
    public bool IsActive { get; set; } = true;
}
