namespace PayGate.DTOs;

public class PaymentDto
{
    
    
}

public class PaymentRequestDto
{
    public string idBooking { get; set; }
    public decimal price { get; set; }
    public string  timestamp { get; set; }
    public string callBackUrl { get; set; }
}


public class PaymentResponseDto
{
    public string BuilId { get; set; }
    public string BankAccount { get; set; }
    public string NameAccount { get; set; }
    public string BankId { get; set; }
    
}

public class PayGateRequestDto
{
    public string Idbooking { get; set; }
    public decimal price { get; set; }
    public string? timestamp { get; set; }
    public string Build { get; set; }
    public string status { get; set; }
}

public class GateCall
{
    public string idBooking { get; set; }
}
