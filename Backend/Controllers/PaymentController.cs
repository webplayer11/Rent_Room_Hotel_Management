using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;
using RoomManagement.Utils;

namespace RoomManagement.Controllers;

[ApiController]
[Route("api/payments")]

public class PaymentController : ControllerBase
{
    private readonly IPaymentService _service;
    private readonly HttpClient _httpClient;

    public PaymentController(IPaymentService service,  HttpClient httpClient)
    {
        _service = service;
        _httpClient = httpClient;
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var result = await _service.ProcessPaymentAsync(userId, dto);
        if (result == null) return BadRequest(ResponseApi<string>.Failure(400, "Thanh toán thất bại hoặc đơn đặt phòng không tồn tại"));

        return Ok(ResponseApi<PaymentDto>.Success(result, "Thanh toán thành công"));
    }

    [HttpGet("booking/{bookingId}")]
    public async Task<IActionResult> GetPaymentsByBooking(string bookingId)
    {
        var result = await _service.GetPaymentsByBookingIdAsync(bookingId);
        return Ok(ResponseApi<IEnumerable<PaymentDto>>.Success(result));
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
                    callBackUrl = "http://localhost:5226/api/pay/callback"
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
                return Ok(ResponseApi<PaymentResponseDto>.Success(qrUrl));
            }
            catch (Exception ex)
            {
                return StatusCode(500,ResponseApi<string>.Failure(500,"Tạo build thành toán thất bại!"));
            }
    }

    [HttpPost("callback")]
    public async Task<IActionResult> CallBack(PayGateRequestDto payGateRequestDto)
    {
            var signature = Request.Headers["X-Signature"].ToString();
            var result = await _service.CallBackPaymentAsync(payGateRequestDto, signature);
            if (!result)
            {
                return BadRequest();
            }
            return Ok();
    }
}
