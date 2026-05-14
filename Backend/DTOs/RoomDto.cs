namespace RoomManagement.DTOs;

public class RoomDto
{
    public string Id { get; set; } = default!;
    public string? HotelId { get; set; }
    public string? RoomNumber { get; set; }
    public string? RoomType { get; set; }
    public string? Description { get; set; }
    public int Capacity { get; set; }
    public int BedCount { get; set; }
    public string? BedType { get; set; }
    public decimal PricePerNight { get; set; }
    public decimal? DiscountPrice { get; set; }
    public double? RoomSize { get; set; }
    public string? Status { get; set; }
    public bool IsSmokingAllowed { get; set; }
    public bool IsActive { get; set; }
}

public class CreateRoomDto
{
    public string HotelId { get; set; } = default!;
    public string? RoomNumber { get; set; }
    public string? RoomType { get; set; }
    public string? Description { get; set; }
    public int Capacity { get; set; }
    public int BedCount { get; set; }
    public string? BedType { get; set; }
    public decimal PricePerNight { get; set; }
    public decimal? DiscountPrice { get; set; }
    public double? RoomSize { get; set; }
    public bool IsSmokingAllowed { get; set; }
}
