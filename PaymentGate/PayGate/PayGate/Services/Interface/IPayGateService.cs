using PayGate.DTOs;

namespace PayGate.Services.Interface;

public interface IPayGateService
{
    Task<PaymentResponseDto>  CreateBuiltPayment(PaymentRequestDto paymentRequestDto, string signature);
    Task<string> CallBackBackEnd();
}