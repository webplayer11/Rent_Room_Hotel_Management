using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models
{
    [Table("Account")]
    public class Account
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = default!;

        [MaxLength(100)]
        public string? Email { get; set; }

        [MaxLength(255)]
        public string? Password { get; set; }

        [MaxLength(20)]
        public string? Status { get; set; }

        [MaxLength(20)]
        public string? Role { get; set; }
    }
}
