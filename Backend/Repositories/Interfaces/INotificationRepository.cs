using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces
{
    public interface INotificationRepository : IGenericRepository<Notification>
    {
        Task<IEnumerable<Notification>> GetByCustomerIdAsync(string customerId);
        Task<int> GetUnreadCountAsync(string customerId);
        Task MarkAllAsReadAsync(string customerId);
    }
}