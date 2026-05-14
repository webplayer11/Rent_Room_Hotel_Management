using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using PayGate.DTOs;
using PayGate.Services.Interface;
using PayGate.Ultis;

namespace PayGate.Controllers;

[ApiController]
[Route("api/paymentgate")]
public class PaymentController : ControllerBase
{
    
    private readonly IPayGateService _payGateService;
    private readonly HttpClient _httpClient;

    public PaymentController(IPayGateService payGateService,  HttpClient httpClient)
    {
        _payGateService = payGateService;
        _httpClient = httpClient;
    }
    
    [HttpPost("createbuiltpayment")]
    public async Task<IActionResult> CreatBill(PaymentRequestDto paymentRequestDto)
    {
        try
        {
            var signature = Request.Headers["X-Signature"].ToString();
            var result = await _payGateService.CreateBuiltPayment(paymentRequestDto,signature);
            return Ok(ResponseApi<PaymentResponseDto>.Success(result));  
        }
        catch (Exception ex)
        {
            return BadRequest(ResponseApi<string>.Failure(400, ex.Message));
        }

    }

    [HttpPost("callback")]
    public async Task<IActionResult> CallbackPayment(GateCall gateCall)
    {
        
        var result = await _payGateService.CallBackBackEnd(gateCall.idBooking);
        if (result == null) return BadRequest(ResponseApi<string>.Failure(400,"looix ddaay"));
        var data = $"{result.Build}|{result.Idbooking}|{result.price}|{result.timestamp}";
        var signature = _payGateService.GenerateHmacSha256(data, an.Key);
        var request = new HttpRequestMessage(
            HttpMethod.Post,
            "http://localhost:5204/api/payments/callback"
        );
        request.Headers.Add("X-Signature", signature);
        request.Content = JsonContent.Create(result);
        var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            return StatusCode(
                (int)response.StatusCode,
                ResponseApi<string>.Failure(
                    (int)response.StatusCode,
                    $"Callback thất bại:"
                )
            );
        }
        return Ok();
    }
    
}