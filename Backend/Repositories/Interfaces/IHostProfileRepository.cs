using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces;

public interface IHostProfileRepository
{
    Task<HostProfile?> GetByIdAsync(string id);
    Task<HostProfile?> UpdateAsync(HostProfile hostProfile);
    Task<IEnumerable<HostProfile>> GetHostsByStatusAsync(bool isVerified);
}
