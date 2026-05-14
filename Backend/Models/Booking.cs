using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models;

[Table("Booking")]
public class Booking
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = default!;

    [MaxLength(450)]
    public string UserId { get; set; } = default!;

    [MaxLength(50)]
    public string RoomId { get; set; } = default!;

    [MaxLength(50)]
    public string? VoucherId { get; set; }

    [MaxLength(50)]
    public string BookingCode { get; set; } = default!;

    public DateOnly CheckInDate { get; set; }

    public DateOnly CheckOutDate { get; set; }

    public int NumberOfNights { get; set; }

    public int GuestCount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalPrice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? DiscountAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal FinalPrice { get; set; }

    public string? SpecialRequest { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, CheckedIn, Completed, Cancelled

    public string? CancellationReason { get; set; }

    [Column(TypeName = "datetime2")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "datetime2")]
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(UserId))]
    public ApplicationUser User { get; set; } = default!;

    [ForeignKey(nameof(RoomId))]
    public Room Room { get; set; } = default!;

    [ForeignKey(nameof(VoucherId))]
    public Voucher? Voucher { get; set; }

    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public Invoice? Invoice { get; set; }
    public Review? Review { get; set; }
}
