using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models;

/// <summary>
/// Khách sạn — entity chính. Host đăng ký khách sạn lên nền tảng.
/// </summary>
[Table("Hotel")]
public class Hotel
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = default!;

    [MaxLength(200)]
    public string? Name { get; set; }

    public string? Description { get; set; }

    public string? Address { get; set; }

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public int? StarRating { get; set; } // 1-5 sao

    [MaxLength(10)]
    public string? CheckInTime { get; set; } // "14:00"

    [MaxLength(10)]
    public string? CheckOutTime { get; set; } // "12:00"

    public string? CancellationPolicy { get; set; }

    public bool IsApproved { get; set; } = false;
    public bool IsActive { get; set; } = true;

    [Column(TypeName = "datetime2")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "datetime2")]
    public DateTime? UpdatedAt { get; set; }

    // FK → HostProfile
    [MaxLength(450)]
    public string HostId { get; set; } = default!;

    // Navigation
    [ForeignKey(nameof(HostId))]
    public HostProfile? Host { get; set; }

    public ICollection<Room> Rooms { get; set; } = new List<Room>();
    public ICollection<HotelImage> Images { get; set; } = new List<HotelImage>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<RevenueReport> RevenueReports { get; set; } = new List<RevenueReport>();

    // Many-to-many (Fluent API)
    public ICollection<Amenity> Amenities { get; set; } = new List<Amenity>();
}
