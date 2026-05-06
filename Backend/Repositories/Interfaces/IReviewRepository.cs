using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces
{
    public interface IReviewRepository : IGenericRepository<Review>
    {
        Task<IEnumerable<Review>> GetByHotelIdAsync(string hotelId);
        Task<IEnumerable<Review>> GetByCustomerIdAsync(string customerId);
        Task<double> GetAverageRatingAsync(string hotelId);
    }
}