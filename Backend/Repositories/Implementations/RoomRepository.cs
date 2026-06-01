using Microsoft.EntityFrameworkCore;
using RoomManagement.Data;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;

namespace RoomManagement.Repositories.Implementations;

public class RoomRepository : IRoomRepository
{
    private readonly AppDbContext _context;

    public RoomRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Room>> GetByHotelIdAsync(string hotelId)
    {
        return await _context.Rooms
            .Include(r => r.Images)
            .Include(r => r.RoomAmenities)
            .Where(r => r.HotelId == hotelId)
            .ToListAsync();
    }

    public async Task<Room?> GetByIdAsync(string id)
    {
        return await _context.Rooms
            .Include(r => r.Images)
            .Include(r => r.RoomAmenities)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Room> CreateAsync(Room room)
    {
        room.Id = Guid.NewGuid().ToString();
        _context.Rooms.Add(room);
        await _context.SaveChangesAsync();
        return room;
    }

    public async Task<Room> UpdateAsync(Room room)
    {
        _context.Rooms.Update(room);
        await _context.SaveChangesAsync();
        return room;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var room = await GetByIdAsync(id);
        if (room == null) return false;
        
        //xóa room đồng thời xóa các thông tin liên quan như booking, review, invoice, payment
        var bookings = await _context.Bookings
            .Where(b => b.RoomId == id)
            .ToListAsync();

        var bookingIds = bookings.Select(b => b.Id).ToList();

        if (bookingIds.Any())
        {
            var reviews = await _context.Reviews
                .Where(r => r.BookingId != null && bookingIds.Contains(r.BookingId!))
                .ToListAsync();
            foreach (var rv in reviews)
                rv.BookingId = null;

            var invoices = await _context.Invoices
                .Where(i => bookingIds.Contains(i.BookingId))
                .ToListAsync();
            _context.Invoices.RemoveRange(invoices);

            var payments = await _context.Payments
                .Where(p => bookingIds.Contains(p.BookingId))
                .ToListAsync();
            _context.Payments.RemoveRange(payments);

            _context.Bookings.RemoveRange(bookings);
        }

        var roomImages = await _context.RoomImages.Where(ri => ri.RoomId == id).ToListAsync();
        _context.RoomImages.RemoveRange(roomImages);

        _context.Rooms.Remove(room);
        await _context.SaveChangesAsync();
        return true;
    }
}
