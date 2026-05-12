using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers
{
    [ApiController]
    [Route("api/booking")]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _service;

        public BookingController(IBookingService service) => _service = service;

        //lấy danh sách booking bằng id khách hàng
        [HttpGet("customer/{customerId}")]
        [Authorize]
        public async Task<IActionResult> GetByCustomer(string customerId) {
            var data = await _service.GetByCustomerAsync(customerId);
            return Ok(ResponseApi<IEnumerable<BookingDto>>.Success(data));
        }

        //lấy chi tiết booking bằng id của booking
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetDetail(string id)
        {
            var result = await _service.GetDetailAsync(id);
            return result is null
                ? NotFound(ResponseApi<BookingDetailDto>.Failure(404, "Không tìm thấy booking."))
                : Ok(ResponseApi<BookingDetailDto>.Success(result));
        }

        //tạo booking mới
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateBookingDto dto)
        {
            try
            {
                var result = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetDetail), new { id = result.Id },
                    ResponseApi<BookingDto>.Success(result, "Đặt phòng thành công.", 201));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ResponseApi<object>.Failure(409, ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ResponseApi<object>.Failure(404, ex.Message));
            }
        }

    }
}