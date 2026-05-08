using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;
using RoomManagement.Utils;

namespace RoomManagement.Controllers
{
    [ApiController]
    [Route("api/pay")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _service;
        
        
        private readonly HttpClient _httpClient;

 

        public PaymentController(IPaymentService service, HttpClient httpClient) 
        {
            _service = service;
            _httpClient = httpClient;
        
        }    

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
        [HttpPost ("createpayment")]
        public async Task<IActionResult> CreatePayment(PaymentRequestDto paymentRequestDto)
        {
            var request = new HttpRequestMessage(
                HttpMethod.Post,
                "http://localhost:5193/api/paymentgate/createbuiltpayment"
            );
            var data = $"{paymentRequestDto.idBooking}|{paymentRequestDto.price}|{paymentRequestDto.timestamp}";
            var signature = _service.GenerateHmacSha256(data, AppRoles.Key);
            request.Headers.Add("X-Signature", signature);
            request.Content = JsonContent.Create(paymentRequestDto);
            var response = await _httpClient.SendAsync(request);
            var datas = await response.Content.ReadAsStringAsync();
            
            if(!response.IsSuccessStatusCode)
            {
                return StatusCode(
                    (int)response.StatusCode,
                    ResponseApi<string>.Failure(
                        (int)response.StatusCode,
                        $"Payment gateway error: {datas}"
                    )
                );
            }
            var result = JsonSerializer.Deserialize<ResponseApi<PayGateResponseDto>>(datas);
            if (result is null)
            {
                return BadRequest(ResponseApi<string>.Failure(400,""));
            }
            var qrUrl = await _service.CreateQrUrlAsync(paymentRequestDto, result);
             return Ok(qrUrl);
        }
        
        
    }
}