using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models;

/// <summary>
/// Tiện ích khách sạn (WiFi, Bể bơi, Bãi đỗ xe, Gym...).
/// Quan hệ Many-to-Many với Hotel.
/// </summary>
[Table("Amenity")]
public class Amenity
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = default!;

    [MaxLength(100)]
    public string? Name { get; set; }

    public string? Description { get; set; }

    [MaxLength(100)]
    public string? Icon { get; set; }

    [MaxLength(50)]
    public string? Category { get; set; } // General, Safety, Bathroom, Kitchen...

    // Many-to-many (Fluent API)
    public ICollection<Hotel> Hotels { get; set; } = new List<Hotel>();
}
