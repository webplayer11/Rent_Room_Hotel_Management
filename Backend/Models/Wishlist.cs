using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models
{
    [Table("Wishlist")]
    public class Wishlist
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = default!;

        [MaxLength(50)]
        public string? CustomerId { get; set; }

        [MaxLength(50)]
        public string? HotelId { get; set; }

        // Navigation
        [ForeignKey(nameof(CustomerId))]
        public Customer? Customer { get; set; }

        [ForeignKey(nameof(HotelId))]
        public Hotel? Hotel { get; set; }
    }
}
