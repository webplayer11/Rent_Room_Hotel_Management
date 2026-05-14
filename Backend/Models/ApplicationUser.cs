using Microsoft.AspNetCore.Identity;

namespace RoomManagement.Models;

/// <summary>
/// Entity duy nhất cho tất cả người dùng (Customer, Host, Admin).
/// Phân biệt vai trò thông qua Identity Roles.
/// </summary>
public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Refresh token cho JWT
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    // Navigation — 1-1 với HostProfile (chỉ khi user có role Host)
    public HostProfile? HostProfile { get; set; }

    // Navigation — quan hệ 1-N
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
