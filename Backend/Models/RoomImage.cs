using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models
{
    [Table("RoomImage")]
    public class RoomImage
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = default!;

        [MaxLength(50)]
        public string? RoomId { get; set; }

        public string? Url { get; set; }

        public string? Caption { get; set; }

        // Navigation
        public Room? RoomNav { get; set; }
    }
}
