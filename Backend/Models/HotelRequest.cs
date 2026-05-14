using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models;

[Table("HotelRequest")]
public class HotelRequest
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = default!;

    [MaxLength(50)]
    public string HotelId { get; set; } = default!;

    [MaxLength(450)]
    public string HostId { get; set; } = default!;

    [MaxLength(50)]
    public string RequestType { get; set; } = default!; // Delete, Update, Deactivate

    public string Reason { get; set; } = default!;

    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

    public string? AdminNote { get; set; }

    [Column(TypeName = "datetime2")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "datetime2")]
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(HotelId))]
    public Hotel Hotel { get; set; } = default!;

    [ForeignKey(nameof(HostId))]
    public HostProfile Host { get; set; } = default!;
}
