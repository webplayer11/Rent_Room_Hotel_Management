using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models
{
    [Table("Hotel")]
    public class Hotel
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = default!;

        [MaxLength(100)]
        public string? Name { get; set; }

        public string? Address { get; set; }

        public string? Description { get; set; }

        public bool? IsApproved { get; set; }

        [MaxLength(50)]
        public string? OwnerId { get; set; }

        // Navigation
        [ForeignKey(nameof(OwnerId))]
        public HotelOwner? Owner { get; set; }

        public ICollection<Room>          Rooms          { get; set; } = new List<Room>();
        public ICollection<HotelImage>    Images         { get; set; } = new List<HotelImage>();
        public ICollection<Review>        Reviews        { get; set; } = new List<Review>();
        public ICollection<RevenueReport> RevenueReports { get; set; } = new List<RevenueReport>();

        // Many-to-many (configured via Fluent API in DbContext)
        public ICollection<HotelAmenity> Amenities { get; set; } = new List<HotelAmenity>();
    }
}
