namespace RoomManagement.DTOs;

public class HostRevenueDto
{
    public decimal TotalRevenue { get; set; }
    public decimal CommissionRate { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal NetRevenue { get; set; } // Doanh thu thực nhận
    public int TotalBookings { get; set; }
    public int CompletedBookings { get; set; }
    public int CancelledBookings { get; set; }
    public List<RevenueByTimeDto> ByYear { get; set; } = new();
    public List<RevenueByTimeDto> ByMonth { get; set; } = new();
    public List<HotelRevenueItemDto> ByHotel { get; set; } = new();
}

public class RevenueByTimeDto
{
    public string Period { get; set; } = default!;
    public decimal Revenue { get; set; }
}

public class HotelRevenueItemDto
{
    public string HotelId { get; set; } = default!;
    public string? HotelName { get; set; }
    public decimal Revenue { get; set; }
    public decimal Commission { get; set; }
    public decimal NetRevenue { get; set; }
    public int BookingCount { get; set; }
}

public class HotelRevenueDetailDto
{
    public string HotelId { get; set; } = default!;
    public string? HotelName { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal Commission { get; set; }
    public decimal NetRevenue { get; set; }
    public int TotalBookings { get; set; }
    public int CompletedBookings { get; set; }
    public int CancelledBookings { get; set; }
    public List<RevenueByTimeDto> ByYear { get; set; } = new();
    public List<RevenueByTimeDto> ByMonth { get; set; } = new();
}
