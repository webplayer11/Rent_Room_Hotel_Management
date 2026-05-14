using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models;

/// <summary>
/// Tiện ích riêng cho phòng (TV, Tủ lạnh, Máy giặt, Điều hòa...).
/// Quan hệ Many-to-Many với Room.
/// </summary>
[Table("RoomAmenity")]
public class RoomAmenity
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = default!;

    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(100)]
    public string? Icon { get; set; }

    // Many-to-many (Fluent API)
    public ICollection<Room> Rooms { get; set; } = new List<Room>();
}
