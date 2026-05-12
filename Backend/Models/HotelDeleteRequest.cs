using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models
{
    [Table("HotelDeleteRequest")]
    public class HotelDeleteRequest
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = default!;

        [Required]
        [MaxLength(50)]
        public string HotelId { get; set; } = default!;

        [Required]
        [MaxLength(50)]
        public string OwnerId { get; set; } = default!;

        [Required]
        [MaxLength(500)]
        public string Reason { get; set; } = default!;

        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Cancelled

        [MaxLength(500)]
        public string? AdminNote { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "datetime2")]
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        [ForeignKey(nameof(HotelId))]
        public Hotel? Hotel { get; set; }

        [ForeignKey(nameof(OwnerId))]
        public HotelOwner? Owner { get; set; }
    }
}
