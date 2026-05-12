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
            => Ok(ResponseApi<IEnumerable<HotelDto>>.Success(await _service.GetAllApprovedAsync()));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetail(string id)
        {
            var result = await _service.GetDetailAsync(id);
            return result is null
                ? NotFound(ResponseApi<HotelDetailDto>.Failure(404, "Không tìm thấy khách sạn."))
                : Ok(ResponseApi<HotelDetailDto>.Success(result));
        }

        [HttpGet("owner/{ownerId}")]
        public async Task<IActionResult> GetByOwner(string ownerId)
            => Ok(ResponseApi<IEnumerable<HotelDto>>.Success(await _service.GetByOwnerAsync(ownerId)));

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
                return BadRequest(ResponseApi<object>.Failure(400, "Từ khóa không được để trống."));
            return Ok(ResponseApi<IEnumerable<HotelDto>>.Success(await _service.SearchAsync(keyword)));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateHotelDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetDetail), new { id = result.Id },
                ResponseApi<HotelDto>.Success(result, "Tạo khách sạn thành công.", 201));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateHotelDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            return result is null
                ? NotFound(ResponseApi<HotelDto>.Failure(404, "Không tìm thấy khách sạn."))
                : Ok(ResponseApi<HotelDto>.Success(result, "Cập nhật thành công."));
        }

        [HttpPatch("{id}/approve")]
        public async Task<IActionResult> Approve(string id)
        {
            var success = await _service.ApproveAsync(id);
            return success
                ? Ok(ResponseApi<object>.Success(null, "Duyệt khách sạn thành công."))
                : NotFound(ResponseApi<object>.Failure(404, "Không tìm thấy khách sạn."));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteAsync(id);
            return success
                ? Ok(ResponseApi<object>.Success(null, "Xóa thành công."))
                : NotFound(ResponseApi<object>.Failure(404, "Không tìm thấy khách sạn."));
        }
    }
}