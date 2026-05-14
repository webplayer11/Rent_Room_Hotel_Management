using PayGate.DTOs;

namespace PayGate.Services.Interface;

public interface IPayGateService
{
    Task<PaymentResponseDto>  CreateBuiltPayment(PaymentRequestDto paymentRequestDto, string signature);
    Task<PayGateRequestDto> CallBackBackEnd(string gateCall);
    string GenerateHmacSha256(string data, string secretKey);
}