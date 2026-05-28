using Microsoft.EntityFrameworkCore;
using RoomManagement.Data;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;

namespace RoomManagement.Repositories.Implementations;

public class BookingRepository : IBookingRepository
{
    private readonly AppDbContext _context;

    public BookingRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Booking>> GetByUserIdAsync(string userId)
    {
        return await _context.Bookings
            .Include(b => b.Room)
            .ThenInclude(r => r.Hotel)
            .Include(b => b.Voucher)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetByHostIdAsync(string hostId)
    {
        // Find all bookings for rooms that belong to hotels owned by the host
        return await _context.Bookings
            .Include(b => b.Room)
            .ThenInclude(r => r.Hotel)
            .Include(b => b.User)
            .Include(b => b.Voucher)
            .Where(b => b.Room.Hotel!.HostId == hostId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<Booking?> GetByIdAsync(string id)
    {
        return await _context.Bookings
            .Include(b => b.Room)
            .ThenInclude(r => r.Hotel)
            .Include(b => b.User)
            .Include(b => b.Voucher)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<Booking> CreateAsync(Booking booking)
    {
        booking.Id = Guid.NewGuid().ToString();
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();
        return booking;
    }

    public async Task<Booking> UpdateAsync(Booking booking)
    {
        _context.Bookings.Update(booking);
        await _context.SaveChangesAsync();
        return booking;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null) return false;
        
        _context.Bookings.Remove(booking);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> HasConflictingBookingAsync(string roomId, DateOnly checkIn, DateOnly checkOut)
    {
        // Hai khoảng ngày [A_in, A_out) và [B_in, B_out) bị trùng khi:
        //   A_in < B_out  &&  A_out > B_in
        // Bỏ qua các booking đã Cancelled hoặc Completed
        return await _context.Bookings.AnyAsync(b =>
            b.RoomId == roomId &&
            b.Status != "Cancelled" &&
            b.Status != "Completed" &&
            b.CheckInDate < checkOut &&
            b.CheckOutDate > checkIn
        );
    }
}
