using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers;

[ApiController]
[Route("api/hosts")]
public class HostProfileController : ControllerBase
{
    private readonly IHostProfileService _service;

    public HostProfileController(IHostProfileService service)
    {
        _service = service;
    }

    [HttpGet("me")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var profile = await _service.GetProfileAsync(userId);
        if (profile == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy hồ sơ Host"));

        return Ok(ResponseApi<HostProfileDto>.Success(profile));
    }

    [HttpPut("me")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateHostProfileDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var profile = await _service.UpdateProfileAsync(userId, dto);
        if (profile == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy hồ sơ Host"));

        return Ok(ResponseApi<HostProfileDto>.Success(profile, "Cập nhật hồ sơ thành công"));
    }

    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPendingHosts()
    {
        var hosts = await _service.GetHostsByStatusAsync(false);
        return Ok(ResponseApi<IEnumerable<HostProfileDto>>.Success(hosts));
    }

    [HttpGet("approved")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetApprovedHosts()
    {
        var hosts = await _service.GetHostsByStatusAsync(true);
        return Ok(ResponseApi<IEnumerable<HostProfileDto>>.Success(hosts));
    }

    [HttpPost("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApproveHost(string id)
    {
        var result = await _service.ApproveHostAsync(id);
        if (!result) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy HostProfile"));

        return Ok(ResponseApi<string>.Success(null!, "Duyệt Host thành công"));
    }
}
