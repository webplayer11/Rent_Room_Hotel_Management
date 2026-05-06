using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VoucherController : ControllerBase
    {
        private readonly IVoucherService _service;

        public VoucherController(IVoucherService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetActive()
            => Ok(new ApiResponse<IEnumerable<VoucherDto>>(true, null, await _service.GetActiveAsync()));

        [HttpGet("code/{code}")]
        public async Task<IActionResult> GetByCode(string code)
        {
            var result = await _service.GetByCodeAsync(code);
            return result is null
                ? NotFound(new ApiResponse<VoucherDto>(false, "Mã giảm giá không hợp lệ hoặc hết hạn.", null))
                : Ok(new ApiResponse<VoucherDto>(true, null, result));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] VoucherDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(new ApiResponse<VoucherDto>(true, "Tạo voucher thành công.", result));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteAsync(id);
            return success
                ? Ok(new ApiResponse<object>(true, "Xóa voucher thành công.", null))
                : NotFound(new ApiResponse<object>(false, "Không tìm thấy voucher.", null));
        }
    }
}