using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models;

/// <summary>
/// Thông tin bổ sung khi user đăng ký làm chủ khách sạn (Host).
/// Quan hệ 1-1 với ApplicationUser (Id = UserId).
/// </summary>
[Table("HostProfile")]
public class HostProfile
{
    [Key]
    [MaxLength(450)]
    public string Id { get; set; } = default!; // = ApplicationUser.Id

    [MaxLength(200)]
    public string? CompanyName { get; set; }

    [MaxLength(50)]
    public string? TaxCode { get; set; }

    [MaxLength(50)]
    public string? BankAccount { get; set; }

    [MaxLength(100)]
    public string? BankName { get; set; }

    public List<string> BusinessLicenseUrls { get; set; } = new();

    public bool IsVerified { get; set; } = false;

    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

    public string? RejectionReason { get; set; }

    [Column(TypeName = "datetime2")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(Id))]
    public ApplicationUser User { get; set; } = default!;

    public ICollection<Hotel> Hotels { get; set; } = new List<Hotel>();
}
