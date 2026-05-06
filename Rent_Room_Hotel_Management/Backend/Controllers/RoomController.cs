using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomController : ControllerBase
    {
        private readonly IRoomService _service;

        public RoomController(IRoomService service) => _service = service;

        [HttpGet("hotel/{hotelId}")]
        public async Task<IActionResult> GetByHotel(string hotelId)
            => Ok(new ApiResponse<IEnumerable<RoomDto>>(true, null, await _service.GetByHotelAsync(hotelId)));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var result = await _service.GetByIdAsync(id);
            return result is null
                ? NotFound(new ApiResponse<RoomDto>(false, "Không tìm thấy phòng.", null))
                : Ok(new ApiResponse<RoomDto>(true, null, result));
        }

        [HttpGet("available")]
        public async Task<IActionResult> GetAvailable(
            [FromQuery] string hotelId,
            [FromQuery] DateOnly startDate,
            [FromQuery] DateOnly endDate)
        {
            if (startDate >= endDate)
                return BadRequest(new ApiResponse<object>(false, "Ngày bắt đầu phải trước ngày kết thúc.", null));
            return Ok(new ApiResponse<IEnumerable<RoomDto>>(true, null,
                await _service.GetAvailableAsync(hotelId, startDate, endDate)));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRoomDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id },
                new ApiResponse<RoomDto>(true, "Tạo phòng thành công.", result));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateRoomDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            return result is null
                ? NotFound(new ApiResponse<RoomDto>(false, "Không tìm thấy phòng.", null))
                : Ok(new ApiResponse<RoomDto>(true, "Cập nhật thành công.", result));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteAsync(id);
            return success
                ? Ok(new ApiResponse<object>(true, "Xóa thành công.", null))
                : NotFound(new ApiResponse<object>(false, "Không tìm thấy phòng.", null));
        }
    }
}