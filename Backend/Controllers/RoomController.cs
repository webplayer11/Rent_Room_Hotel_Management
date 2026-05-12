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
            => Ok(ResponseApi<IEnumerable<RoomDto>>.Success(await _service.GetByHotelAsync(hotelId)));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var result = await _service.GetByIdAsync(id);
            return result is null
                ? NotFound(ResponseApi<RoomDto>.Failure(404, "Không tìm thấy phòng."))
                : Ok(ResponseApi<RoomDto>.Success(result));
        }

        [HttpGet("available")]
        public async Task<IActionResult> GetAvailable(
            [FromQuery] string hotelId,
            [FromQuery] DateOnly startDate,
            [FromQuery] DateOnly endDate)
        {
            if (startDate >= endDate)
                return BadRequest(ResponseApi<object>.Failure(400, "Ngày bắt đầu phải trước ngày kết thúc."));
            return Ok(ResponseApi<IEnumerable<RoomDto>>.Success(
                await _service.GetAvailableAsync(hotelId, startDate, endDate)));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRoomDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id },
                ResponseApi<RoomDto>.Success(result, "Tạo phòng thành công.", 201));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateRoomDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            return result is null
                ? NotFound(ResponseApi<RoomDto>.Failure(404, "Không tìm thấy phòng."))
                : Ok(ResponseApi<RoomDto>.Success(result, "Cập nhật thành công."));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteAsync(id);
            return success
                ? Ok(ResponseApi<object>.Success(null, "Xóa thành công."))
                : NotFound(ResponseApi<object>.Failure(404, "Không tìm thấy phòng."));
        }
    }
}