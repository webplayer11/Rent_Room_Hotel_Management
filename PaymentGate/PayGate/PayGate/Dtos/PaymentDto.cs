namespace PayGate.DTOs;

public class PaymentDto
{
    
    
}

public class PaymentRequestDto
{
    public int idBooking { get; set; }
    public decimal price { get; set; }
    public string  timestamp { get; set; }
    public string callBackUrl { get; set; }
}


public class PaymentResponseDto
{
    public string builId { get; set; }
    public string bankAccount { get; set; }
    public string nameAccount { get; set; }
    public string bankId { get; set; }
    
}
