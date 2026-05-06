using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models
{
    [Table("Admin")]
    public class Admin
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = default!;

        [MaxLength(50)]
        public string? AccountId { get; set; }

        public int? AdminLevel { get; set; }

        // Navigation
        [ForeignKey(nameof(AccountId))]
        public Account? Account { get; set; }
    }
}
