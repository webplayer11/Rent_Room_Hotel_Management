using System.Security.Cryptography;
using System.Text;
using PayGate.DTOs;
using PayGate.Services.Interface;
using PayGate.Ultis;

namespace PayGate.Services.Impliment
{
    public class PayGateService : IPayGateService
    {
        private static List<BuildDto> _buildDtos = new List<BuildDto>();
        
        

        public  async Task<PaymentResponseDto> CreateBuiltPayment(PaymentRequestDto paymentRequestDto, string signature)
        {
            
            var dataTosign = $"{paymentRequestDto.idBooking}|{paymentRequestDto.price}|{paymentRequestDto.timestamp}";
            var signatureCreate = GenerateHmacSha256(dataTosign, an.Key);

            if (signatureCreate != signature)
            {
                throw new Exception("Chữ kí không hợp lệ");
            }
            var timestampCreat = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            if (timestampCreat - long.Parse(paymentRequestDto.timestamp) > 300)
            {
                throw new Exception("Quá thời gian");
            }
            var buildID = "BuildID_" + DateTime.Now.ToString("yyyyMMddHHmmss");
            var build = new BuildDto
            {
                buildID = buildID,
                idBooking = paymentRequestDto.idBooking,
                callBackUrl = paymentRequestDto.callBackUrl,
                price = paymentRequestDto.price,
                status = "Pending",
            };
            _buildDtos.Add(build);
            
            return new PaymentResponseDto
            {
                BuilId = buildID,
                BankAccount = an.accountNo,
                BankId = an.bankId,
                NameAccount = an.accountName

            };
        }

        public async Task<PayGateRequestDto> CallBackBackEnd(int idBooking)
        {
            var build =  _buildDtos.FirstOrDefault(b => b.idBooking == idBooking);
            if (build == null)
                //throw new Exception("Không tìm thấy Build payment");
                return null;
            build.status = "SUCCESS";
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
            
            return new PayGateRequestDto
            {
                Build = build.buildID,
                Idbooking = build.idBooking,
                price = build.price,
                timestamp = timestamp,
                status = build.status,
            } ;
        }

        public string GenerateHmacSha256(string data, string secretKey)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            var dataBytes = Encoding.UTF8.GetBytes(data);

            using var hmac = new HMACSHA256(keyBytes);

            var hashBytes = hmac.ComputeHash(dataBytes);

            return Convert.ToHexString(hashBytes).ToLower();
        }
    }

}

