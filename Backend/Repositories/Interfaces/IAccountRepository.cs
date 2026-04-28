using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces
{
    public interface IAccountRepository : IGenericRepository<Account>
    {
        Task<Account?> GetByEmailAsync(string email);
        Task<bool> EmailExistsAsync(string email);
    }
}