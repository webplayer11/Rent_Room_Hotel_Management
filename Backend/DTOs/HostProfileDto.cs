namespace RoomManagement.DTOs;

public class HostProfileDto
{
    public string Id { get; set; } = default!;
    public string? CompanyName { get; set; }
    public string? TaxCode { get; set; }
    public string? BankAccount { get; set; }
    public string? BankName { get; set; }
    public bool IsVerified { get; set; }
    public List<string> BusinessLicenseUrls { get; set; } = new();
    
    // User info for Admin
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateHostProfileDto
{
    public string? CompanyName { get; set; }
    public string? TaxCode { get; set; }
    public string? BankAccount { get; set; }
    public string? BankName { get; set; }
}
