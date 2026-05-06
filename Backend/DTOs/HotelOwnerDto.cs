namespace RoomManagement.DTOs
{
    public record HotelOwnerDto(
        string Id,
        string? AccountId,
        string? CompanyName,
        string? TaxCode,
        string? Phone
    );

    public record CreateHotelOwnerDto(
        string Id,
        string AccountId,
        string? CompanyName,
        string? TaxCode,
        string? Phone
    );
}