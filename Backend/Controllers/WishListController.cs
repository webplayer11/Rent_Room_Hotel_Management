using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace YourProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _service;

        public WishlistController(IWishlistService service) => _service = service;

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(string customerId)
            => Ok(new ApiResponse<IEnumerable<WishlistDto>>(true, null,
                await _service.GetByCustomerAsync(customerId)));

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] CreateWishlistDto dto)
        {
            if (await _service.ExistsAsync(dto.CustomerId, dto.HotelId))
                return Conflict(new ApiResponse<object>(false, "Khách sạn đã có trong danh sách yêu thích.", null));

            var result = await _service.AddAsync(dto);
            return Ok(new ApiResponse<WishlistDto>(true, "Thêm vào yêu thích thành công.", result));
        }

        [HttpDelete]
        public async Task<IActionResult> Remove([FromQuery] string customerId, [FromQuery] string hotelId)
        {
            var success = await _service.RemoveAsync(customerId, hotelId);
            return success
                ? Ok(new ApiResponse<object>(true, "Xóa khỏi yêu thích thành công.", null))
                : NotFound(new ApiResponse<object>(false, "Không tìm thấy mục yêu thích.", null));
        }
    }
}