using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _repo;

        public ReviewService(IReviewRepository repo) => _repo = repo;

        public async Task<IEnumerable<ReviewDto>> GetByHotelAsync(string hotelId)
            => (await _repo.GetByHotelIdAsync(hotelId)).Select(MapToDto);

        public async Task<IEnumerable<ReviewDto>> GetByCustomerAsync(string customerId)
            => (await _repo.GetByCustomerIdAsync(customerId)).Select(MapToDto);

        public async Task<ReviewDto> CreateAsync(CreateReviewDto dto)
        {
            var entity = new Review
            {
                Id = dto.Id,
                HotelId = dto.HotelId,
                CustomerId = dto.CustomerId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };
            return MapToDto(await _repo.CreateAsync(entity));
        }

        public Task<bool> DeleteAsync(string id) => _repo.DeleteAsync(id);

        public Task<double> GetAverageRatingAsync(string hotelId)
            => _repo.GetAverageRatingAsync(hotelId);

        private static ReviewDto MapToDto(Review r) => new(
            r.Id, r.HotelId, r.CustomerId, r.Customer?.Name,
            r.Rating, r.Comment, r.CreatedAt);
    }
}