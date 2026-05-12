namespace PayGate.DTOs;

public class BuildDto
{
    public string buildID {get; set;}
    public int idBooking { get; set; }
    public decimal price { get; set; }
    public string callBackUrl { get; set; }
    public string status { get; set; }
}

public class BuildResposeDto
{
    public string buildID {get; set;}
    public int idBooking { get; set; }
    public decimal price { get; set; }
    public string timestamp { get; set; }
    public string status { get; set; }
}