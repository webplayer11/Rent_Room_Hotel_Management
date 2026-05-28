using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;
using RoomManagement.Utils;

namespace RoomManagement.Services.Implementations;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IMapper _mapper;

    public PaymentService(IPaymentRepository paymentRepository, IBookingRepository bookingRepository, IMapper mapper)
    {
        _paymentRepository = paymentRepository;
        _bookingRepository = bookingRepository;
        _mapper = mapper;
    }

    public async Task<PaymentDto?> ProcessPaymentAsync(string userId, ProcessPaymentRequestDto dto)
    {
        var booking = await _bookingRepository.GetByIdAsync(dto.BookingId);
        if (booking == null || booking.UserId != userId) return null;

        var payment = new Payment
        {
            BookingId = dto.BookingId,
            Amount = booking.FinalPrice,
            Method = dto.Method,
            Status = "PENDING", // Simulated payment success

        };
        var created = await _paymentRepository.CreateAsync(payment);

        return _mapper.Map<PaymentDto>(created);
    }

    public async Task<IEnumerable<PaymentDto>> GetPaymentsByBookingIdAsync(string bookingId)
    {
        var payments = await _paymentRepository.GetByBookingIdAsync(bookingId);
        return _mapper.Map<IEnumerable<PaymentDto>>(payments);
    }



//theem
    public string GenerateHmacSha256(string data, string secretKey)
    {
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            var dataBytes = Encoding.UTF8.GetBytes(data);
            using var hmac = new HMACSHA256(keyBytes);
            var hashBytes = hmac.ComputeHash(dataBytes);
            return Convert.ToHexString(hashBytes).ToLower();
    }


    public async Task<PaymentResponseDto> CreateQrUrlAsync(PaymentRequestDto paymentRequestDto, ResponseApi<PayGateResponseDto> paygateResponse)
    {
            if (paygateResponse.Data == null)
            {
                throw new Exception("Dữ liệu từ PaymentGate trả về bị rỗng.");
            }

            // Tạo bản ghi Payment
            var payment = new Payment
            {
                BookingId = paymentRequestDto.idBooking,
                Amount = paymentRequestDto.price,
                Method = "QR",
                Status = "PENDING",
                TransactionId = paygateResponse.Data.BuilId
            };
            await _paymentRepository.CreateAsync(payment);

            var payget = new PayGateResponseDto
            {
                BuilId = paygateResponse.Data.BuilId,
                BankAccount =  paygateResponse.Data.BankAccount,
                NameAccount =   paygateResponse.Data.NameAccount,
                BankId =  paygateResponse.Data.BankId,

            };
            var url = BuildVietQrUrl(payget.BankId, payget.BankAccount, payget.NameAccount,
                paymentRequestDto.price, paymentRequestDto.idBooking);
            
         //   var Url = BuildVietQrUrl(payget.BankId,)

            return new PaymentResponseDto
            {
                IdBooking = paymentRequestDto.idBooking,
                BuilId = payget.BuilId,
                QrUrl = url
            };

    }

    private string BuildVietQrUrl(string bankId, string accountNo, string accountName,
            decimal amount, string orderId)
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


    public async Task<bool> CallBackPaymentAsync(PayGateRequestDto payGateRequestDto, string secretKey)
    {
            var dataTosign = $"{payGateRequestDto.Build}|{payGateRequestDto.Idbooking}|{payGateRequestDto.price}|{payGateRequestDto.timestamp}";
            var checkSign = GenerateHmacSha256(dataTosign, AppRoles.Key);
            var timestampCreat = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            if (checkSign != secretKey || timestampCreat - long.Parse(payGateRequestDto.timestamp) > 300 )
            {
                return false;
            }

           var result = await _paymentRepository.UpdateStatusAsync(payGateRequestDto.Build);
            
            if (!result)
            {
                return false;
            }

            // Đồng bộ trạng thái thanh toán sang Booking
            var booking = await _bookingRepository.GetByIdAsync(payGateRequestDto.Idbooking);
            if (booking != null)
            {
                booking.Status = "Confirmed";
                await _bookingRepository.UpdateAsync(booking);
            }

            return true;
    }

    public async Task<string> GetStatusAsync(string idbooking)
    {
        var payments = await _paymentRepository.GetByBookingIdAsync(idbooking);
        var payment = payments.FirstOrDefault();
        if (payment == null)
        {
            return string.Empty;
        }
        return payment.Status;
    }
}
