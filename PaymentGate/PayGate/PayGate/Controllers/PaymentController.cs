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

    public PaymentController(IPayGateService payGateService)
    {
        _payGateService = payGateService;
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
    public async Task<IActionResult> CallbackPayment()
    {
        return Ok();
    }
    
}