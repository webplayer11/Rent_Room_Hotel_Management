using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models
{
    [Table("Promotion")]
    public class Promotion
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = default!;

        [MaxLength(100)]
        public string? Name { get; set; }

        public double? DiscountPercent { get; set; }

        public DateOnly? StartDate { get; set; }

        public DateOnly? EndDate { get; set; }

        [MaxLength(50)]
        public string? RoomTypeApplied { get; set; }
    }
}
