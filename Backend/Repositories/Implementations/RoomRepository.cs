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
        return await _context.Rooms.Where(r => r.HotelId == hotelId).ToListAsync();
    }

    public async Task<Room?> GetByIdAsync(string id)
    {
        return await _context.Rooms.FirstOrDefaultAsync(r => r.Id == id);
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
        
        _context.Rooms.Remove(room);
        await _context.SaveChangesAsync();
        return true;
    }
}
