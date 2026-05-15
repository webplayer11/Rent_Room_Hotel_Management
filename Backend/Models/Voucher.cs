using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models;

/// <summary>
/// Voucher giảm giá. HotelId = null → voucher toàn sàn (Admin tạo).
/// HotelId có giá trị → voucher riêng cho 1 KS (Host tạo).
/// </summary>

[Table("Voucher")]
public class Voucher
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = default!;

    [MaxLength(50)]
    public string Code { get; set; } = default!;

    [MaxLength(50)]
    public string? Type { get; set; } // Percent, FixedAmount

    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountValue { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MaxDiscountAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MinOrderAmount { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public int UsageLimit { get; set; }

    public int UsedCount { get; set; } = 0;

    public int? MinNights { get; set; } // Số đêm tối thiểu để áp dụng

    public bool IsActive { get; set; } = true;

    // FK → Hotel (nullable: null = voucher toàn sàn)
    [MaxLength(50)]
    public string? HotelId { get; set; }

    // FK → ApplicationUser (người tạo voucher)
    [MaxLength(450)]
    public string? CreatedByUserId { get; set; }

    // Navigation
    [ForeignKey(nameof(HotelId))]
    public Hotel? Hotel { get; set; }

    [ForeignKey(nameof(CreatedByUserId))]
    public ApplicationUser? CreatedByUser { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
