using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models
{
    [Table("Room")]
    public class Room
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = default!;

        [MaxLength(50)]
        public string? HotelId { get; set; }

        [MaxLength(20)]
        public string? RoomNumber { get; set; }

        [MaxLength(50)]
        public string? RoomType { get; set; }

        public int? Capacity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PricePerNight { get; set; }

        [MaxLength(20)]
        public string? Status { get; set; }

        public string? Description { get; set; }

        public bool? IsSmokingAllowed { get; set; }

        // Navigation
        [ForeignKey(nameof(HotelId))]
        public Hotel? Hotel { get; set; }

        public ICollection<RoomImage> Images   { get; set; } = new List<RoomImage>();
        public ICollection<Booking>   Bookings { get; set; } = new List<Booking>();
    }
}
