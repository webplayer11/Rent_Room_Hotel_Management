using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models
{
    [Table("Customer")]
    public class Customer
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = default!;

        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        public string? Address { get; set; }

        [MaxLength(100)]
        public string? IdentityDoc { get; set; }

        // Navigation

        public ICollection<Booking>      Bookings      { get; set; } = new List<Booking>();
        public ICollection<Review>       Reviews       { get; set; } = new List<Review>();
        public ICollection<Wishlist>     Wishlists     { get; set; } = new List<Wishlist>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}
