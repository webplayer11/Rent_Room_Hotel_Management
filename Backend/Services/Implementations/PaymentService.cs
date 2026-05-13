using System.Security.Cryptography;
using System.Text;
using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;
using RoomManagement.Utils;

namespace RoomManagement.Services.Implementations
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _repo;

        public PaymentService(IPaymentRepository repo) => _repo = repo;

        public async Task<IEnumerable<PaymentDto>> GetByBookingAsync(string bookingId)
            => (await _repo.GetByBookingIdAsync(bookingId)).Select(MapToDto);

        public async Task<PaymentDto> CreateAsync(CreatePaymentDto dto)
        {
            var entity = new Payment
            {
                Id = dto.Id,
                BookingId = dto.BookingId,
                Amount = dto.Amount,
                Method = dto.Method,
                Status = "Pending",
                TransactionId = dto.TransactionId,
                PaidAt = DateTime.UtcNow
            };
            return MapToDto(await _repo.CreateAsync(entity));
        }

        public async Task<PaymentDto?> GetByTransactionIdAsync(string transactionId)
        {
            var p = await _repo.GetByTransactionIdAsync(transactionId);
            return p is null ? null : MapToDto(p);
        }

        private static PaymentDto MapToDto(Payment p) => new(
            p.Id, p.BookingId, p.Amount, p.Method,
            p.Status, p.TransactionId, p.PaidAt, p.RefundedAt);
        
        
        public string GenerateHmacSha256(string data, string secretKey)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            var dataBytes = Encoding.UTF8.GetBytes(data);
            using var hmac = new HMACSHA256(keyBytes);
            var hashBytes = hmac.ComputeHash(dataBytes);
            return Convert.ToHexString(hashBytes).ToLower();
        }
        private string BuildVietQrUrl(string bankId, string accountNo, string accountName,
            decimal amount, int orderId)
        {
            var addInfo = Uri.EscapeDataString($"Thanh toan {orderId}");
            var encodedName = Uri.EscapeDataString(accountName);
            var url =
                $"https://img.vietqr.io/image/{bankId}-{accountNo}-compact2.png" +
                $"?amount={amount}" +
                $"&addInfo={addInfo}" +
                $"&accountName={encodedName}";
            return url;
        }

        
        public async Task<PaymentResponseDto> CreateQrUrlAsync(PaymentRequestDto paymentRequestDto, ResponseApi<PayGateResponseDto> paygateResponse)
        {
            var payget = new PayGateResponseDto
            {
                BuilId = paygateResponse.Data.BuilId,
                BankAccount =  paygateResponse.Data.BankAccount,
                NameAccount =   paygateResponse.Data.NameAccount,
                BankId =  paygateResponse.Data.BankId,

            };
            var url = BuildVietQrUrl(payget.BankId, payget.BankAccount, payget.NameAccount,
                paymentRequestDto.price, paymentRequestDto.idBooking);

            return new PaymentResponseDto
            {
                IdBooking = paymentRequestDto.idBooking,
                BuilId = payget.BuilId,
                QrUrl = url
            };

        }

        public async Task<bool> CallBackPaymentAsync(PayGateRequestDto payGateRequestDto, string secretKey)
        {
            var dataTosign = $"{payGateRequestDto.Build}|{payGateRequestDto.Idbooking}|{payGateRequestDto.price}|{payGateRequestDto.timestamp}";
            var checkSign = GenerateHmacSha256(dataTosign, AppRoles.Key);
            var timestampCreat = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            if (checkSign != secretKey || timestampCreat - long.Parse(payGateRequestDto.timestamp) > 300 )
            {
                return false;
            }
            // cập nhật lại status của booking  = Paid
            
            return true;
        }
    }
}