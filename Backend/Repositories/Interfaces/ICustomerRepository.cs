using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces
{
    public interface ICustomerRepository : IGenericRepository<Customer>
    {
        Task<Customer?> GetWithAccountAsync(string id);
        Task<Customer?> GetByAccountIdAsync(string accountId);
    }
}