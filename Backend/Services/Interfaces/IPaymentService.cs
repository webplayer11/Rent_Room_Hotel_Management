using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces;

public interface IPaymentService
{
    Task<PaymentDto?> ProcessPaymentAsync(string userId, ProcessPaymentDto dto);
    Task<IEnumerable<PaymentDto>> GetPaymentsByBookingIdAsync(string bookingId);

    string GenerateHmacSha256(string data, string secretKey);
    Task<PaymentResponseDto> CreateQrUrlAsync(PaymentRequestDto paymentRequestDto ,ResponseApi<PayGateResponseDto> paygateResponse );
    Task<bool> CallBackPaymentAsync(PayGateRequestDto payGateRequestDto, string secretKey);
}
