using Microsoft.EntityFrameworkCore;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Data;

namespace RoomManagement.Repositories.Implementations
{
    public class RevenueReportRepository : GenericRepository<RevenueReport>, IRevenueReportRepository
    {
        public RevenueReportRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<RevenueReport>> GetByHotelIdAsync(string hotelId)
            => await _dbSet.AsNoTracking()
                           .Where(r => r.HotelId == hotelId)
                           .ToListAsync();
    }
}
