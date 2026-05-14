using Microsoft.EntityFrameworkCore;
using RoomManagement.Data;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;

namespace RoomManagement.Repositories.Implementations;

public class HostProfileRepository : IHostProfileRepository
{
    private readonly AppDbContext _context;

    public HostProfileRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<HostProfile?> GetByIdAsync(string id)
    {
        return await _context.HostProfiles
            .Include(h => h.User)
            .FirstOrDefaultAsync(h => h.Id == id);
    }

    public async Task<IEnumerable<HostProfile>> GetHostsByStatusAsync(bool isVerified)
    {
        return await _context.HostProfiles
            .Include(h => h.User)
            .Where(h => h.IsVerified == isVerified)
            .ToListAsync();
    }

    public async Task<HostProfile?> UpdateAsync(HostProfile hostProfile)
    {
        _context.HostProfiles.Update(hostProfile);
        await _context.SaveChangesAsync();
        return hostProfile;
    }
}
