using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers;

[ApiController]
[Route("api/vouchers")]
public class VoucherController : ControllerBase
{
    private readonly IVoucherService _service;

    public VoucherController(IVoucherService service)
    {
        _service = service;
    }

    // ── System Vouchers (Admin) ──────────────────────────────────

    [HttpPost("system")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateSystemVoucher([FromBody] CreateSystemVoucherDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var result = await _service.CreateSystemVoucherAsync(userId, dto);
        return Ok(ResponseApi<VoucherDto>.Success(result, "Tạo voucher toàn sàn thành công", 201));
    }

    [HttpGet("system")]
    public async Task<IActionResult> GetSystemVouchers()
    {
        var result = await _service.GetSystemVouchersAsync();
        return Ok(ResponseApi<IEnumerable<VoucherDto>>.Success(result));
    }

    // ── Hotel Vouchers (Host) ────────────────────────────────────

    [HttpPost("hotel")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> CreateHotelVoucher([FromBody] CreateHotelVoucherDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var result = await _service.CreateHotelVoucherAsync(userId, dto);
        if (result == null) return BadRequest(ResponseApi<string>.Failure(400, "Không thể tạo voucher. Kiểm tra quyền sở hữu khách sạn."));

        return Ok(ResponseApi<VoucherDto>.Success(result, "Tạo voucher cho khách sạn thành công", 201));
    }

    [HttpGet("hotel/{hotelId}")]
    public async Task<IActionResult> GetHotelVouchers(string hotelId)
    {
        var result = await _service.GetHotelVouchersAsync(hotelId);
        return Ok(ResponseApi<IEnumerable<VoucherDto>>.Success(result));
    }

    [HttpGet("my-vouchers")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> GetMyVouchers()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var result = await _service.GetMyVouchersAsync(userId);
        return Ok(ResponseApi<IEnumerable<VoucherDto>>.Success(result));
    }

    // ── Common ───────────────────────────────────────────────────

    [HttpGet("{id}/stats")]
    [Authorize(Roles = "Host,Admin")]
    public async Task<IActionResult> GetVoucherStats(string id)
    {
        var result = await _service.GetVoucherStatsAsync(id);
        if (result == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy voucher"));

        return Ok(ResponseApi<VoucherStatsDto>.Success(result));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Host,Admin")]
    public async Task<IActionResult> DeleteVoucher(string id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var result = await _service.DeleteVoucherAsync(userId, id);
        if (!result) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy voucher hoặc bạn không có quyền"));

        return Ok(ResponseApi<string>.Success(null!, "Xóa voucher thành công"));
    }

    [HttpGet("validate/{code}")]
    public async Task<IActionResult> ValidateVoucher(string code)
    {
        var result = await _service.ValidateVoucherAsync(code);
        return Ok(ResponseApi<ValidateVoucherDto>.Success(result));
    }
}
