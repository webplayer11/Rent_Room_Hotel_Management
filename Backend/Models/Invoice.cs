using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models;

[Table("Invoice")]
public class Invoice
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = default!;

    [MaxLength(50)]
    public string BookingId { get; set; } = default!;

    [MaxLength(50)]
    public string InvoiceNumber { get; set; } = default!;

    [Column(TypeName = "decimal(18,2)")]
    public decimal SubTotal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TaxAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [Column(TypeName = "datetime2")]
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(BookingId))]
    public Booking Booking { get; set; } = default!;
}
