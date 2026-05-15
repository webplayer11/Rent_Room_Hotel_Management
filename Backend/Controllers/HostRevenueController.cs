using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers;

[ApiController]
[Route("api/hosts/revenue")]
[Authorize(Roles = "Host")]
public class HostRevenueController : ControllerBase
{
    private readonly IHostRevenueService _service;

    public HostRevenueController(IHostRevenueService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyRevenue()
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.GetHostRevenueAsync(hostId);
        return Ok(ResponseApi<HostRevenueDto>.Success(result));
    }

    [HttpGet("{hotelId}")]
    public async Task<IActionResult> GetHotelRevenue(string hotelId)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.GetHotelRevenueAsync(hostId, hotelId);
        if (result == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy khách sạn hoặc bạn không có quyền"));

        return Ok(ResponseApi<HotelRevenueItemDto>.Success(result));
    }
}
