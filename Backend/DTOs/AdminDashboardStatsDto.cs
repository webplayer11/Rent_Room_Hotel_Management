namespace RoomManagement.DTOs;

public class AdminDashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalHotels { get; set; }
    public int TotalHosts { get; set; }
    public int TotalVouchers { get; set; }
    public int LockedUsers { get; set; }
    public int SuspendedHotels { get; set; }
    public int PendingHosts { get; set; }
    public int PendingHotels { get; set; }
}