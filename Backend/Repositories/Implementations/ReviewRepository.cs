using Microsoft.EntityFrameworkCore;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Data;

namespace RoomManagement.Repositories.Implementations
{
    public class ReviewRepository : GenericRepository<Review>, IReviewRepository
    {
        public ReviewRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Review>> GetByHotelIdAsync(string hotelId)
            => await _dbSet.AsNoTracking()
                           .Where(r => r.HotelId == hotelId)
                           .Include(r => r.Customer)
                           .OrderByDescending(r => r.CreatedAt)
                           .ToListAsync();

        public async Task<IEnumerable<Review>> GetByCustomerIdAsync(string customerId)
            => await _dbSet.AsNoTracking()
                           .Where(r => r.CustomerId == customerId)
                           .Include(r => r.Hotel)
                           .OrderByDescending(r => r.CreatedAt)
                           .ToListAsync();

        public async Task<double> GetAverageRatingAsync(string hotelId)
        {
            var reviews = await _dbSet.AsNoTracking()
                                      .Where(r => r.HotelId == hotelId && r.Rating.HasValue)
                                      .ToListAsync();
            return reviews.Any() ? reviews.Average(r => r.Rating!.Value) : 0;
        }
    }
}
