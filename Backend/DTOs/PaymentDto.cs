using System.Text.Json.Serialization;

namespace RoomManagement.DTOs;

public class PaymentDto
{
    public string Id { get; set; } = default!;
    public string BookingId { get; set; } = default!;
    public decimal Amount { get; set; }
    public string Method { get; set; } = default!;
    public string Status { get; set; } = "Pending";
    public string? TransactionId { get; set; }
    public DateTime? PaidAt { get; set; }
}

public class ProcessPaymentDto
{
    public string BookingId { get; set; } = default!;
    public string Method { get; set; } = default!; // Cash, CreditCard, VNPay, Momo
}


// customer request payment
public class PaymentRequestDto
{
    public string idBooking { get; set; }
    public decimal price { get; set; }
}

public class PaymentRequestGwDto
{
    public string idBooking { get; set; }
    public decimal price { get; set; }
    public string? timestamp { get; set; }
    public string? callBackUrl { get; set; }
}

public class PaymentResponseDto
{
    public string IdBooking { get; set; }
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

public class PayGateRequestDto
{
    public int Idbooking { get; set; }
    public decimal price { get; set; }
    public string? timestamp { get; set; }
    public string Build { get; set; }
    public string status { get; set; }
}