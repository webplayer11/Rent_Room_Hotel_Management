using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models;

[Table("RevenueReport")]
public class RevenueReport
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = default!;

    [MaxLength(50)]
    public string HotelId { get; set; } = default!;

    [MaxLength(50)]
    public string PeriodType { get; set; } = default!; // Daily, Weekly, Monthly, Yearly

    public DateOnly PeriodStart { get; set; }

    public DateOnly PeriodEnd { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalRevenue { get; set; }

    public int TotalBookings { get; set; }

    public double OccupancyRate { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Commission { get; set; }

    [Column(TypeName = "datetime2")]
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(HotelId))]
    public Hotel Hotel { get; set; } = default!;
}
