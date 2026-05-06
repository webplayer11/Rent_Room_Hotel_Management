using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repo;

        public NotificationService(INotificationRepository repo) => _repo = repo;

        public async Task<IEnumerable<NotificationDto>> GetByCustomerAsync(string customerId)
            => (await _repo.GetByCustomerIdAsync(customerId)).Select(MapToDto);

        public Task<int> GetUnreadCountAsync(string customerId)
            => _repo.GetUnreadCountAsync(customerId);

        public Task MarkAllAsReadAsync(string customerId)
            => _repo.MarkAllAsReadAsync(customerId);

        public async Task<NotificationDto> SendAsync(NotificationDto dto)
        {
            var entity = new Notification
            {
                Id = dto.Id,
                CustomerId = dto.CustomerId,
                Type = dto.Type,
                Message = dto.Message,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };
            return MapToDto(await _repo.CreateAsync(entity));
        }

        private static NotificationDto MapToDto(Notification n) => new(
            n.Id, n.CustomerId, n.Type, n.Message, n.SentAt, n.IsRead);
    }
}