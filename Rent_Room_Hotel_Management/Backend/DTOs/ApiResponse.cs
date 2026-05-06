namespace RoomManagement.DTOs
{
    public record ApiResponse<T>(bool Success, string? Message, T? Data);

    public record PagedResult<T>(
        IEnumerable<T> Items,
        int TotalCount,
        int Page,
        int PageSize
    );
}