using System.Text.Json.Serialization;

namespace RoomManagement.DTOs
{
    public record PaymentDto(
        string Id,
        string? BookingId,
        decimal? Amount,
        string? Method,
        string? Status,
        string? TransactionId,
        DateTime? PaidAt,
        DateTime? RefundedAt
    );

    public record CreatePaymentDto(
        string Id,
        string BookingId,
        decimal Amount,
        string Method,
        string? TransactionId
    );

    public class PaymentRequestDto
    {
        public int idBooking { get; set; }
        public decimal price { get; set; }
        public string?  timestamp { get; set; }
        public string? callBackUrl { get; set; }
       
    }
    public class PaymentResponseDto
    {
        public int IdBooking { get; set; }
        public string? BuilId { get; set; }
        public string? QrUrl { get; set; }
    }
    
    public class PayGateResponseDto
    {
        [JsonPropertyName("builId")]
        public string? BuilId { get; set; }

        [JsonPropertyName("bankAccount")]
        public string? BankAccount { get; set; }

        [JsonPropertyName("nameAccount")]
        public string? NameAccount { get; set; }

        [JsonPropertyName("bankId")]
        public string? BankId { get; set; }
    }
      
}