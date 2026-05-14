using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingController : ControllerBase
{
    private readonly IBookingService _service;

    public BookingController(IBookingService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var result = await _service.CreateBookingAsync(userId, dto);
        if (result == null) return BadRequest(ResponseApi<string>.Failure(400, "Phòng không khả dụng hoặc ngày đặt không hợp lệ"));

        return Ok(ResponseApi<BookingDto>.Success(result, "Tạo đơn đặt phòng thành công", 201));
    }

    [HttpGet("my-bookings")]
    public async Task<IActionResult> GetMyBookings()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var result = await _service.GetMyBookingsAsync(userId);
        return Ok(ResponseApi<IEnumerable<BookingDto>>.Success(result));
    }

    [HttpGet("host-bookings")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> GetHostBookings()
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.GetHostBookingsAsync(hostId);
        return Ok(ResponseApi<IEnumerable<BookingDto>>.Success(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy đơn đặt phòng"));
        return Ok(ResponseApi<BookingDto>.Success(result));
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateBookingStatusDto dto)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.UpdateBookingStatusAsync(hostId, id, dto);
        if (result == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy đơn đặt phòng hoặc bạn không có quyền"));

        return Ok(ResponseApi<BookingDto>.Success(result, "Cập nhật trạng thái thành công"));
    }
}
