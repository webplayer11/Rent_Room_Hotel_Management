using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models;

[Table("Wishlist")]
public class Wishlist
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = default!;

    [MaxLength(450)]
    public string UserId { get; set; } = default!;

    [MaxLength(50)]
    public string HotelId { get; set; } = default!;

    [Column(TypeName = "datetime2")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(UserId))]
    public ApplicationUser User { get; set; } = default!;

    [ForeignKey(nameof(HotelId))]
    public Hotel Hotel { get; set; } = default!;
}
