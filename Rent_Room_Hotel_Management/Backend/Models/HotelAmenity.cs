using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models
{
    [Table("HotelAmenity")]
    public class HotelAmenity
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = default!;

        [MaxLength(100)]
        public string? Name { get; set; }

        public string? Description { get; set; }

        [MaxLength(100)]
        public string? Icon { get; set; }

        // Many-to-many (configured via Fluent API in DbContext)
        public ICollection<Hotel> Hotels { get; set; } = new List<Hotel>();
    }
}
