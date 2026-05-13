namespace RoomManagement.DTOs
{
    public record HotelOwnerDto(
        string Id,
        string? CompanyName,
        string? TaxCode,
        string? Phone
    );

    public record CreateHotelOwnerDto(
        string Id,
        string? CompanyName,
        string? TaxCode,
        string? Phone
    );
}