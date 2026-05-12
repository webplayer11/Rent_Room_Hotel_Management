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
            => Ok(ResponseApi<IEnumerable<PaymentDto>>.Success(await _service.GetByBookingAsync(bookingId)));

        [HttpGet("transaction/{transactionId}")]
        public async Task<IActionResult> GetByTransaction(string transactionId)
        {
            var result = await _service.GetByTransactionIdAsync(transactionId);
            return result is null
                ? NotFound(ResponseApi<PaymentDto>.Failure(404, "Không tìm thấy giao dịch."))
                : Ok(ResponseApi<PaymentDto>.Success(result));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePaymentDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetByTransaction),
                new { transactionId = result.TransactionId },
                ResponseApi<PaymentDto>.Success(result, "Thanh toán thành công.", 201));
        }
        [HttpPost ("createpayment")]
        public async Task<IActionResult> CreatePayment(PaymentRequestDto paymentRequestDto)
        {
            try
            {
                var request = new HttpRequestMessage(
                    HttpMethod.Post,
                    "http://localhost:5193/api/paymentgate/createbuiltpayment"
                );
                var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
                var data = $"{paymentRequestDto.idBooking}|{paymentRequestDto.price}|{timestamp}";
                var signature = _service.GenerateHmacSha256(data, AppRoles.Key);
                var paymenRequest = new PaymentRequestGwDto
                {
                    idBooking = paymentRequestDto.idBooking,
                    price = paymentRequestDto.price,
                    timestamp = timestamp,
                    callBackUrl = "http://localhost:5204/api/pay/callbackbe"
                };
                request.Headers.Add("X-Signature", signature);
                request.Content = JsonContent.Create(paymenRequest);
                var response = await _httpClient.SendAsync(request);
                var datas = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
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
                    return BadRequest(ResponseApi<string>.Failure(400, ""));
                }

                var qrUrl = await _service.CreateQrUrlAsync(paymentRequestDto, result);
                return Ok(qrUrl);
            }
            catch (Exception ex)
            {
                return StatusCode(500,ResponseApi<string>.Failure(500,"Tạo build thành toán thất bại!"));
            }
            var qrUrl = await _service.CreateQrUrlAsync(paymentRequestDto, result);
             return Ok(ResponseApi<PaymentResponseDto>.Success(qrUrl));
        }
        
        
    }
}