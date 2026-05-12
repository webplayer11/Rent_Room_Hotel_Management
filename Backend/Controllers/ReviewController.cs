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
            => Ok(ResponseApi<IEnumerable<ReviewDto>>.Success(await _service.GetByHotelAsync(hotelId)));

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(string customerId)
            => Ok(ResponseApi<IEnumerable<ReviewDto>>.Success(await _service.GetByCustomerAsync(customerId)));

        [HttpGet("hotel/{hotelId}/rating")]
        public async Task<IActionResult> GetAverageRating(string hotelId)
            => Ok(ResponseApi<double>.Success(await _service.GetAverageRatingAsync(hotelId)));

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(ResponseApi<ReviewDto>.Success(result, "Đánh giá thành công."));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteAsync(id);
            return success
                ? Ok(ResponseApi<object>.Success(null, "Xóa đánh giá thành công."))
                : NotFound(ResponseApi<object>.Failure(404, "Không tìm thấy đánh giá."));
        }
    }
}