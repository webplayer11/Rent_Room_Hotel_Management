using Microsoft.EntityFrameworkCore;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Data;

namespace RoomManagement.Repositories.Implementations
{
    public class HotelAmenityRepository : GenericRepository<HotelAmenity>, IHotelAmenityRepository
    {
        public HotelAmenityRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<HotelAmenity>> GetByHotelIdAsync(string hotelId)
            => await _context.Hotels
                             .AsNoTracking()
                             .Where(h => h.Id == hotelId)
                             .SelectMany(h => h.Amenities)
                             .ToListAsync();
    }
}