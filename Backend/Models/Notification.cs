using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models;

[Table("Notification")]
public class Notification
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = default!;

    [MaxLength(450)]
    public string UserId { get; set; } = default!;

    [MaxLength(50)]
    public string? Type { get; set; } // Booking, Payment, System, Promotion

    [MaxLength(200)]
    public string? Title { get; set; }

    public string? Message { get; set; }

    [MaxLength(50)]
    public string? ReferenceId { get; set; }

    public bool IsRead { get; set; } = false;

    [Column(TypeName = "datetime2")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(UserId))]
    public ApplicationUser User { get; set; } = default!;
}
