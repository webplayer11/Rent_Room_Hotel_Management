using Microsoft.EntityFrameworkCore;
using RoomManagement.Data;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;

namespace RoomManagement.Repositories.Implementations;

public class HotelRepository : IHotelRepository
{
    private readonly AppDbContext _context;

    public HotelRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Hotel>> GetAllAsync()
    {
        return await _context.Hotels
            .Include(h => h.Images)
            .ToListAsync();
    }

    public async Task<IEnumerable<Hotel>> GetByHostIdAsync(string hostId)
    {
        return await _context.Hotels
            .Include(h => h.Images)
            .Where(h => h.HostId == hostId)
            .ToListAsync();
    }

    public async Task<Hotel?> GetByIdAsync(string id)
    {
        return await _context.Hotels
            .Include(h => h.Images)
            .FirstOrDefaultAsync(h => h.Id == id);
    }

    public async Task<Hotel> CreateAsync(Hotel hotel)
    {
        hotel.Id = Guid.NewGuid().ToString();
        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();
        return hotel;
    }

    public async Task<Hotel> UpdateAsync(Hotel hotel)
    {
        _context.Hotels.Update(hotel);
        await _context.SaveChangesAsync();
        return hotel;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var hotel = await GetByIdAsync(id);
        if (hotel == null) return false;
        
        _context.Hotels.Remove(hotel);
        await _context.SaveChangesAsync();
        return true;
    }
}
