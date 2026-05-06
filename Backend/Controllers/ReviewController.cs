using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _service;

        public ReviewController(IReviewService service) => _service = service;

        [HttpGet("hotel/{hotelId}")]
        public async Task<IActionResult> GetByHotel(string hotelId)
            => Ok(new ApiResponse<IEnumerable<ReviewDto>>(true, null,
                await _service.GetByHotelAsync(hotelId)));

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(string customerId)
            => Ok(new ApiResponse<IEnumerable<ReviewDto>>(true, null,
                await _service.GetByCustomerAsync(customerId)));

        [HttpGet("hotel/{hotelId}/rating")]
        public async Task<IActionResult> GetAverageRating(string hotelId)
            => Ok(new ApiResponse<double>(true, null, await _service.GetAverageRatingAsync(hotelId)));

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(new ApiResponse<ReviewDto>(true, "Đánh giá thành công.", result));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteAsync(id);
            return success
                ? Ok(new ApiResponse<object>(true, "Xóa đánh giá thành công.", null))
                : NotFound(new ApiResponse<object>(false, "Không tìm thấy đánh giá.", null));
        }
    }
}