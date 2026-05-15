namespace RoomManagement.DTOs;

// ── Host Management ──────────────────────────

public class RejectHostDto
{
    public string Reason { get; set; } = default!;
}

// ── Hotel Management ─────────────────────────

public class SuspendHotelDto
{
    public string Reason { get; set; } = default!;
}

// ── Revenue Stats ────────────────────────────

public class RevenueStatsDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalCommission { get; set; }
    public int TotalBookings { get; set; }
    public int CompletedBookings { get; set; }
    public int PendingBookings { get; set; }
    public int CancelledBookings { get; set; }
    public decimal AverageBookingValue { get; set; }
}

// ── Growth Stats ─────────────────────────────

public class GrowthStatsDto
{
    public int TotalUsers { get; set; }
    public int NewUsersThisMonth { get; set; }
    public int TotalHosts { get; set; }
    public int TotalHotels { get; set; }
    public int ApprovedHotels { get; set; }
    public int TotalBookingsThisMonth { get; set; }
    public int CompletedBookingsThisMonth { get; set; }
    public List<MonthlyStatDto> MonthlyBookings { get; set; } = new();
    public List<MonthlyStatDto> MonthlyRevenue { get; set; } = new();
}

public class MonthlyStatDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int Count { get; set; }
    public decimal Amount { get; set; }
}
