using Microsoft.AspNetCore.Identity;

namespace RoomManagement.Models;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
    public string? Gender { get; set; }
    public string? NumberPhone { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Address { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
}