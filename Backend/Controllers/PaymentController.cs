using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _service;

        public PaymentController(IPaymentService service) => _service = service;

        [HttpGet("booking/{bookingId}")]
        public async Task<IActionResult> GetByBooking(string bookingId)
            => Ok(new ApiResponse<IEnumerable<PaymentDto>>(true, null,
                await _service.GetByBookingAsync(bookingId)));

        [HttpGet("transaction/{transactionId}")]
        public async Task<IActionResult> GetByTransaction(string transactionId)
        {
            var result = await _service.GetByTransactionIdAsync(transactionId);
            return result is null
                ? NotFound(new ApiResponse<PaymentDto>(false, "Không tìm thấy giao dịch.", null))
                : Ok(new ApiResponse<PaymentDto>(true, null, result));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePaymentDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetByTransaction),
                new { transactionId = result.TransactionId },
                new ApiResponse<PaymentDto>(true, "Tạo thanh toán thành công.", result));
        }
    }
}