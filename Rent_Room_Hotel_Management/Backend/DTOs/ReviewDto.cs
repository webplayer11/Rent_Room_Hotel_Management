namespace RoomManagement.DTOs
{
    public record ReviewDto(
        string Id,
        string? HotelId,
        string? CustomerId,
        string? CustomerName,
        double? Rating,
        string? Comment,
        DateTime? CreatedAt
    );

    public record CreateReviewDto(
        string Id,
        string HotelId,
        string CustomerId,
        double Rating,
        string? Comment
    );
}