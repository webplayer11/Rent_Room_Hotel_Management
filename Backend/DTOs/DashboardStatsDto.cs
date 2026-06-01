namespace RoomManagement.DTOs;

public class DashboardStatsDto
{
    public int BookingsToday { get; set; }
    public decimal RevenueThisMonth { get; set; }
    public int EmptyRooms { get; set; }
    public int OccupiedRooms { get; set; }
}
