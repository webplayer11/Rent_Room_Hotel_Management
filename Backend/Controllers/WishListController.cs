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
            => Ok(ResponseApi<IEnumerable<WishlistDto>>.Success(await _service.GetByCustomerAsync(customerId)));

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] CreateWishlistDto dto)
        {
            if (await _service.ExistsAsync(dto.CustomerId, dto.HotelId))
                return Conflict(ResponseApi<object>.Failure(409, "Khách sạn đã có trong danh sách yêu thích."));

            var result = await _service.AddAsync(dto);
            return Ok(ResponseApi<WishlistDto>.Success(result, "Thêm vào yêu thích thành công."));
        }

        [HttpDelete]
        public async Task<IActionResult> Remove([FromQuery] string customerId, [FromQuery] string hotelId)
        {
            var success = await _service.RemoveAsync(customerId, hotelId);
            return success
                ? Ok(ResponseApi<object>.Success(null, "Xóa khỏi yêu thích thành công."))
                : NotFound(ResponseApi<object>.Failure(404, "Không tìm thấy mục yêu thích."));
        }
    }
}