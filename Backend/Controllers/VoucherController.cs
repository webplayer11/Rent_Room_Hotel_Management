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
            => Ok(ResponseApi<IEnumerable<VoucherDto>>.Success(await _service.GetActiveAsync()));

        [HttpGet("code/{code}")]
        public async Task<IActionResult> GetByCode(string code)
        {
            var result = await _service.GetByCodeAsync(code);
            return result is null
                ? NotFound(ResponseApi<VoucherDto>.Failure(404, "Mã giảm giá không hợp lệ hoặc hết hạn."))
                : Ok(ResponseApi<VoucherDto>.Success(result));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] VoucherDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(ResponseApi<VoucherDto>.Success(result, "Tạo voucher thành công."));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteAsync(id);
            return success
                ? Ok(ResponseApi<object>.Success(null, "Xóa voucher thành công."))
                : NotFound(ResponseApi<object>.Failure(404, "Không tìm thấy voucher."));
        }
    }
}