using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models
{
    [Table("HotelImage")]
    public class HotelImage
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = default!;

        [MaxLength(50)]
        public string? HotelId { get; set; }

        public string? Url { get; set; }

        public string? Caption { get; set; }

        // Navigation
        [ForeignKey(nameof(HotelId))]
        public Hotel? Hotel { get; set; }
    }
}
