using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models;

[Table("Payment")]
public class Payment
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = default!;

    [MaxLength(50)]
    public string BookingId { get; set; } = default!;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [MaxLength(50)]
    public string Method { get; set; } = default!; // Cash, CreditCard, VNPay, Momo

    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Completed, Failed, Refunded

    [MaxLength(100)]
    public string? TransactionId { get; set; }

    [Column(TypeName = "datetime2")]
    public DateTime? PaidAt { get; set; }

    [Column(TypeName = "datetime2")]
    public DateTime? RefundedAt { get; set; }

    public string? Note { get; set; }

    // Navigation
    [ForeignKey(nameof(BookingId))]
    public Booking Booking { get; set; } = default!;
}
