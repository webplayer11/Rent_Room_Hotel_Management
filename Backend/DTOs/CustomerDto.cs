namespace RoomManagement.DTOs
{
    public record CustomerDto(
        string Id,
        string? Name,
        string? Phone,
        string? Address,
        string? IdentityDoc
    );

    public record CreateCustomerDto(
        string Id,
        string? Name,
        string? Phone,
        string? Address,
        string? IdentityDoc
    );

    public record UpdateCustomerDto(
        string? Name,
        string? Phone,
        string? Address,
        string? IdentityDoc
    );
}