using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceService _service;

        public InvoiceController(IInvoiceService service) => _service = service;

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var result = await _service.GetByIdAsync(id);
            return result is null
                ? NotFound(new ApiResponse<InvoiceDto>(false, "Không tìm thấy hóa đơn.", null))
                : Ok(new ApiResponse<InvoiceDto>(true, null, result));
        }

        [HttpGet("booking/{bookingId}")]
        public async Task<IActionResult> GetByBooking(string bookingId)
        {
            var result = await _service.GetByBookingAsync(bookingId);
            return result is null
                ? NotFound(new ApiResponse<InvoiceDto>(false, "Không tìm thấy hóa đơn.", null))
                : Ok(new ApiResponse<InvoiceDto>(true, null, result));
        }
    }
}