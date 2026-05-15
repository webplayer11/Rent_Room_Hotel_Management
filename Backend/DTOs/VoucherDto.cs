using System.ComponentModel.DataAnnotations;

namespace RoomManagement.DTOs;

public class VoucherDto
{
    public string Id { get; set; } = default!;
    public string Code { get; set; } = default!;
    public string? Type { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public int? MinNights { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int UsageLimit { get; set; }
    public int UsedCount { get; set; }
    public bool IsActive { get; set; }
    public string? HotelId { get; set; }
    public string? CreatedByUserId { get; set; }
}

public class CreateSystemVoucherDto
{
    [Required]
    public string Code { get; set; } = default!;

    [Required]
    public string Type { get; set; } = "Percent"; // Percent, FixedAmount

    [Required]
    public decimal DiscountValue { get; set; }

    public decimal? MaxDiscountAmount { get; set; }
    public decimal? MinOrderAmount { get; set; }

    [Required]
    public DateOnly StartDate { get; set; }

    [Required]
    public DateOnly EndDate { get; set; }

    [Required]
    public int UsageLimit { get; set; }
}

public class CreateHotelVoucherDto : CreateSystemVoucherDto
{
    [Required]
    public string HotelId { get; set; } = default!;

    public int? MinNights { get; set; }
}

public class VoucherStatsDto
{
    public string Id { get; set; } = default!;
    public string Code { get; set; } = default!;
    public int UsageLimit { get; set; }
    public int UsedCount { get; set; }
    public int RemainingUses { get; set; }
    public decimal TotalDiscountGiven { get; set; }
}

public class ValidateVoucherDto
{
    public string Code { get; set; } = default!;
    public bool IsValid { get; set; }
    public string? Message { get; set; }
    public VoucherDto? Voucher { get; set; }
}
