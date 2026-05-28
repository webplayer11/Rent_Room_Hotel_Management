using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces;

public interface IBookingRepository
{
    Task<IEnumerable<Booking>> GetByUserIdAsync(string userId);
    Task<IEnumerable<Booking>> GetByHostIdAsync(string hostId);
    Task<Booking?> GetByIdAsync(string id);
    Task<Booking> CreateAsync(Booking booking);
    Task<Booking> UpdateAsync(Booking booking);
    Task<bool> DeleteAsync(string id);
    
    /// <summary>
    /// Kiểm tra xem phòng có booking nào đang hoạt động trùng ngày với khoảng [checkIn, checkOut) không.
    /// Trả về true nếu có xung đột (phòng không thể đặt trong khoảng ngày này).
    /// </summary>
    Task<bool> HasConflictingBookingAsync(string roomId, DateOnly checkIn, DateOnly checkOut);
}
