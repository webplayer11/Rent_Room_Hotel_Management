using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HotelController : ControllerBase
    {
        private readonly IHotelService _service;

        public HotelController(IHotelService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(new ApiResponse<IEnumerable<HotelDto>>(true, null, await _service.GetAllApprovedAsync()));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetail(string id)
        {
            var result = await _service.GetDetailAsync(id);
            return result is null
                ? NotFound(new ApiResponse<HotelDetailDto>(false, "Không tìm thấy khách sạn.", null))
                : Ok(new ApiResponse<HotelDetailDto>(true, null, result));
        }

        [HttpGet("owner/{ownerId}")]
        public async Task<IActionResult> GetByOwner(string ownerId)
            => Ok(new ApiResponse<IEnumerable<HotelDto>>(true, null, await _service.GetByOwnerAsync(ownerId)));

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
                return BadRequest(new ApiResponse<object>(false, "Từ khóa không được để trống.", null));
            return Ok(new ApiResponse<IEnumerable<HotelDto>>(true, null, await _service.SearchAsync(keyword)));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateHotelDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetDetail), new { id = result.Id },
                new ApiResponse<HotelDto>(true, "Tạo khách sạn thành công.", result));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateHotelDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            return result is null
                ? NotFound(new ApiResponse<HotelDto>(false, "Không tìm thấy khách sạn.", null))
                : Ok(new ApiResponse<HotelDto>(true, "Cập nhật thành công.", result));
        }

        [HttpPatch("{id}/approve")]
        public async Task<IActionResult> Approve(string id)
        {
            var success = await _service.ApproveAsync(id);
            return success
                ? Ok(new ApiResponse<object>(true, "Duyệt khách sạn thành công.", null))
                : NotFound(new ApiResponse<object>(false, "Không tìm thấy khách sạn.", null));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteAsync(id);
            return success
                ? Ok(new ApiResponse<object>(true, "Xóa thành công.", null))
                : NotFound(new ApiResponse<object>(false, "Không tìm thấy khách sạn.", null));
        }
    }
}