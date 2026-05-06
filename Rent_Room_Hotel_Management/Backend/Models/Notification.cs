using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models
{
    [Table("Notification")]
    public class Notification
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = default!;

        [MaxLength(50)]
        public string? CustomerId { get; set; }

        [MaxLength(50)]
        public string? Type { get; set; }

        public string? Message { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? SentAt { get; set; }

        public bool? IsRead { get; set; }

        // Navigation
        [ForeignKey(nameof(CustomerId))]
        public Customer? Customer { get; set; }
    }
}
