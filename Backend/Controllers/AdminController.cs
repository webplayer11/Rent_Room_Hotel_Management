using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _service;

    public AdminController(IAdminService service)
    {
        _service = service;
    }

    // ── Host Management ──────────────────────────────────────────

    [HttpGet("hosts/pending")]
    public async Task<IActionResult> GetPendingHosts()
    {
        var result = await _service.GetPendingHostsAsync();
        return Ok(ResponseApi<IEnumerable<HostProfileDto>>.Success(result));
    }

    [HttpGet("hosts/approved")]
    public async Task<IActionResult> GetApprovedHosts()
    {
        var result = await _service.GetApprovedHostsAsync();
        return Ok(ResponseApi<IEnumerable<HostProfileDto>>.Success(result));
    }

    [HttpGet("hosts/{id}")]
    public async Task<IActionResult> GetHostById(string id)
    {
        var result = await _service.GetHostProfileByIdAsync(id);
        if (result == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy hồ sơ Host"));
        
        return Ok(ResponseApi<HostProfileDto>.Success(result));
    }

    [HttpPost("hosts/{id}/approve")]
    public async Task<IActionResult> ApproveHost(string id)
    {
        var result = await _service.ApproveHostAsync(id);
        if (!result) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy HostProfile"));
        return Ok(ResponseApi<string>.Success(null!, "Duyệt Host thành công"));
    }

    [HttpPost("hosts/{id}/reject")]
    public async Task<IActionResult> RejectHost(string id, [FromBody] RejectHostDto dto)
    {
        var result = await _service.RejectHostAsync(id, dto.Reason);
        if (!result) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy HostProfile"));
        return Ok(ResponseApi<string>.Success(null!, "Từ chối Host thành công"));
    }

    // ── Hotel Management ─────────────────────────────────────────

    [HttpGet("hotels")]
    public async Task<IActionResult> GetAllHotels()
    {
        var result = await _service.GetAllHotelsAdminAsync();
        return Ok(ResponseApi<IEnumerable<HotelDto>>.Success(result));
    }

    [HttpGet("hotels/pending")]
    public async Task<IActionResult> GetPendingHotels()
    {
        var result = await _service.GetPendingHotelsAsync();
        return Ok(ResponseApi<IEnumerable<HotelDto>>.Success(result));
    }

    [HttpGet("hotels/approved")]
    public async Task<IActionResult> GetApprovedHotels()
    {
        var result = await _service.GetApprovedHotelsAsync();
        return Ok(ResponseApi<IEnumerable<HotelDto>>.Success(result));
    }

    [HttpGet("hotels/{id}")]
    public async Task<IActionResult> GetHotelById(string id)
    {
        var result = await _service.GetHotelByIdAdminAsync(id);
        if (result == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy khách sạn"));
        
        return Ok(ResponseApi<HotelDto>.Success(result));
    }

    [HttpPost("hotels/{id}/approve")]
    public async Task<IActionResult> ApproveHotel(string id)
    {
        var result = await _service.ApproveHotelAsync(id);
        if (!result) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy khách sạn"));
        return Ok(ResponseApi<string>.Success(null!, "Duyệt khách sạn thành công"));
    }

    [HttpPost("hotels/{id}/suspend")]
    public async Task<IActionResult> SuspendHotel(string id, [FromBody] SuspendHotelDto dto)
    {
        var result = await _service.SuspendHotelAsync(id, dto.Reason);
        if (!result) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy khách sạn"));
        return Ok(ResponseApi<string>.Success(null!, "Tạm dừng khách sạn thành công"));
    }

    [HttpPost("hotels/{id}/unsuspend")]
    public async Task<IActionResult> UnsuspendHotel(string id)
    {
        var result = await _service.UnsuspendHotelAsync(id);
        if (!result) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy khách sạn"));
        return Ok(ResponseApi<string>.Success(null!, "Bỏ tạm dừng khách sạn thành công"));
    }

    [HttpDelete("hotels/{id}")]
    public async Task<IActionResult> DeleteHotel(string id)
    {
        var result = await _service.DeleteHotelAsync(id);
        if (!result) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy khách sạn"));
        return Ok(ResponseApi<string>.Success(null!, "Xóa khách sạn thành công"));
    }

    // ── Statistics ────────────────────────────────────────────────

    [HttpGet("stats/revenue")]
    public async Task<IActionResult> GetRevenueStats()
    {
        var result = await _service.GetRevenueStatsAsync();
        return Ok(ResponseApi<RevenueStatsDto>.Success(result));
    }

    [HttpGet("stats/growth")]
    public async Task<IActionResult> GetGrowthStats()
    {
        var result = await _service.GetGrowthStatsAsync();
        return Ok(ResponseApi<GrowthStatsDto>.Success(result));
    }
}
