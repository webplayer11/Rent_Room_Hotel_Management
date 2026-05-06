using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models
{
    [Table("HotelOwner")]
    public class HotelOwner
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = default!;

        [MaxLength(50)]
        public string? AccountId { get; set; }

        [MaxLength(100)]
        public string? CompanyName { get; set; }

        [MaxLength(50)]
        public string? TaxCode { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        // Navigation
        [ForeignKey(nameof(AccountId))]
        public Account? Account { get; set; }

        public ICollection<Hotel> Hotels { get; set; } = new List<Hotel>();
    }
}
