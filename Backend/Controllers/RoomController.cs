using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers;

[ApiController]
[Route("api/rooms")]
public class RoomController : ControllerBase
{
    private readonly IRoomService _service;

    public RoomController(IRoomService service)
    {
        _service = service;
    }

    [HttpGet("hotel/{hotelId}")]
    public async Task<IActionResult> GetByHotelId(string hotelId)
    {
        var result = await _service.GetByHotelIdAsync(hotelId);
        return Ok(ResponseApi<IEnumerable<RoomDto>>.Success(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy phòng"));
        return Ok(ResponseApi<RoomDto>.Success(result));
    }

    [HttpPost]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> Create([FromBody] CreateRoomDto dto)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.CreateAsync(hostId, dto);
        if (result == null) return BadRequest(ResponseApi<string>.Failure(400, "Không thể tạo phòng, vui lòng kiểm tra quyền sở hữu khách sạn"));

        return Ok(ResponseApi<RoomDto>.Success(result, "Tạo phòng thành công", 201));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> Update(string id, [FromBody] CreateRoomDto dto)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.UpdateAsync(hostId, id, dto);
        if (result == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy phòng hoặc bạn không có quyền"));

        return Ok(ResponseApi<RoomDto>.Success(result, "Cập nhật thành công"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> Delete(string id)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.DeleteAsync(hostId, id);
        if (!result) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy phòng hoặc bạn không có quyền"));

        return Ok(ResponseApi<string>.Success(null!, "Xóa phòng thành công"));
    }
}
