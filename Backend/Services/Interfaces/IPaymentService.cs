using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<IEnumerable<PaymentDto>> GetByBookingAsync(string bookingId);
        Task<PaymentDto> CreateAsync(CreatePaymentDto dto);
        Task<PaymentDto?> GetByTransactionIdAsync(string transactionId);
        string GenerateHmacSha256(string data, string secretKey);
        Task<PaymentResponseDto> CreateQrUrlAsync(PaymentRequestDto paymentRequestDto ,ResponseApi<PayGateResponseDto> paygateResponse );
        Task<bool> CallBackPaymentAsync(PayGateRequestDto payGateRequestDto, string secretKey);
        Task<string> GetStatusAsync(string idbooking);
    }
}