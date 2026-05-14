using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers;

[ApiController]
[Route("api/hotels")]
public class HotelController : ControllerBase
{
    private readonly IHotelService _service;

    public HotelController(IHotelService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(ResponseApi<IEnumerable<HotelDto>>.Success(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy khách sạn"));
        return Ok(ResponseApi<HotelDto>.Success(result));
    }

    [HttpGet("my-hotels")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> GetMyHotels()
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.GetByHostIdAsync(hostId);
        return Ok(ResponseApi<IEnumerable<HotelDto>>.Success(result));
    }

    [HttpPost]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> Create([FromBody] CreateHotelDto dto)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.CreateAsync(hostId, dto);
        return Ok(ResponseApi<HotelDto>.Success(result, "Tạo khách sạn thành công", 201));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateHotelDto dto)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.UpdateAsync(hostId, id, dto);
        if (result == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy khách sạn hoặc bạn không có quyền"));

        return Ok(ResponseApi<HotelDto>.Success(result, "Cập nhật thành công"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> Delete(string id)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.DeleteAsync(hostId, id);
        if (!result) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy khách sạn hoặc bạn không có quyền"));

        return Ok(ResponseApi<string>.Success(null!, "Xóa khách sạn thành công"));
    }
}
