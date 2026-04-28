using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces
{
    public interface INotificationService
    {
        Task<IEnumerable<NotificationDto>> GetByCustomerAsync(string customerId);
        Task<int> GetUnreadCountAsync(string customerId);
        Task MarkAllAsReadAsync(string customerId);
        Task<NotificationDto> SendAsync(NotificationDto dto);
    }
}