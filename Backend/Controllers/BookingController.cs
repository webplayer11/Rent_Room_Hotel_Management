using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _service;

        public BookingController(IBookingService service) => _service = service;

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(string customerId)
            => Ok(new ApiResponse<IEnumerable<BookingDto>>(true, null,
                await _service.GetByCustomerAsync(customerId)));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetail(string id)
        {
            var result = await _service.GetDetailAsync(id);
            return result is null
                ? NotFound(new ApiResponse<BookingDetailDto>(false, "Không tìm thấy booking.", null))
                : Ok(new ApiResponse<BookingDetailDto>(true, null, result));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBookingDto dto)
        {
            try
            {
                var result = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetDetail), new { id = result.Id },
                    new ApiResponse<BookingDto>(true, "Đặt phòng thành công.", result));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new ApiResponse<object>(false, ex.Message, null));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ApiResponse<object>(false, ex.Message, null));
            }
        }

    }
}