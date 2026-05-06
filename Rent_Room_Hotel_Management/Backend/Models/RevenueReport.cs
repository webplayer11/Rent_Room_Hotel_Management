using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models
{
    [Table("RevenueReport")]
    public class RevenueReport
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = default!;

        [MaxLength(50)]
        public string? PeriodType { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? TotalRevenue { get; set; }

        public int? TotalBooking { get; set; }

        public double? OccupancyRate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Commission { get; set; }

        [MaxLength(50)]
        public string? HotelId { get; set; }

        // Navigation
        [ForeignKey(nameof(HotelId))]
        public Hotel? Hotel { get; set; }
    }
}
