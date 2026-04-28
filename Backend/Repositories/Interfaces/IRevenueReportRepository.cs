using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces
{
    public interface IRevenueReportRepository : IGenericRepository<RevenueReport>
    {
        Task<IEnumerable<RevenueReport>> GetByHotelIdAsync(string hotelId);
    }
}