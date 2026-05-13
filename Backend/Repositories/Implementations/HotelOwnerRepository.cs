using Microsoft.EntityFrameworkCore;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Data;

namespace RoomManagement.Repositories.Implementations
{
    public class HotelOwnerRepository : GenericRepository<HotelOwner>, IHotelOwnerRepository
    {
        public HotelOwnerRepository(AppDbContext context) : base(context) { }

        public async Task<HotelOwner?> GetWithHotelsAsync(string id)
            => await _dbSet.AsNoTracking()
                           .Include(o => o.Hotels)
                           .FirstOrDefaultAsync(o => o.Id == id);
    }
}