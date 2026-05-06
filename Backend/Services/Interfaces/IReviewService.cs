using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces
{
    public interface IReviewService
    {
        Task<IEnumerable<ReviewDto>> GetByHotelAsync(string hotelId);
        Task<IEnumerable<ReviewDto>> GetByCustomerAsync(string customerId);
        Task<ReviewDto> CreateAsync(CreateReviewDto dto);
        Task<bool> DeleteAsync(string id);
        Task<double> GetAverageRatingAsync(string hotelId);
    }
}