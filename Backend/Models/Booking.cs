using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models
{
    [Table("Booking")]
    public class Booking
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = default!;

        [MaxLength(50)]
        public string? CustomerId { get; set; }

        [MaxLength(50)]
        public string? RoomId { get; set; }

        [MaxLength(100)]
        public string? ReservationNumber { get; set; }

        public DateOnly? StartDate { get; set; }

        public DateOnly? EndDate { get; set; }

        public int? DurationInDays { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? TotalPrice { get; set; }

        public int? GuestCount { get; set; }

        public string? SpecialRequest { get; set; }

        [MaxLength(20)]
        public string? Status { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? CreatedAt { get; set; }

        // Navigation
        public Room? RoomNav { get; set; }

        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    }
}
