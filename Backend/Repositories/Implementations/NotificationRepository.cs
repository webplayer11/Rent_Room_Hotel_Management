using Microsoft.EntityFrameworkCore;
using RoomManagement.Models;
using RoomManagement.Repositories.Implementations;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Data;

namespace RoomManagement.Repositories.Implementations
{
    public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
    {
        public NotificationRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Notification>> GetByCustomerIdAsync(string customerId)
            => await _dbSet.AsNoTracking()
                           .Where(n => n.CustomerId == customerId)
                           .OrderByDescending(n => n.SentAt)
                           .ToListAsync();

        public async Task<int> GetUnreadCountAsync(string customerId)
            => await _dbSet.CountAsync(n => n.CustomerId == customerId && n.IsRead == false);

        public async Task MarkAllAsReadAsync(string customerId)
        {
            var unread = await _dbSet
                .Where(n => n.CustomerId == customerId && n.IsRead == false)
                .ToListAsync();
            unread.ForEach(n => n.IsRead = true);
            await _context.SaveChangesAsync();
        }
    }
}