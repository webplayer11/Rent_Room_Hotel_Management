using Microsoft.EntityFrameworkCore;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Data;

namespace RoomManagement.Repositories.Implementations
{
    public class CustomerRepository : GenericRepository<Customer>, ICustomerRepository
    {
        public CustomerRepository(AppDbContext context) : base(context) { }

        public async Task<Customer?> GetWithAccountAsync(string id)
            => await _dbSet.AsNoTracking()
                           .Include(c => c.Account)
                           .FirstOrDefaultAsync(c => c.Id == id);

        public async Task<Customer?> GetByAccountIdAsync(string accountId)
            => await _dbSet.AsNoTracking()
                           .FirstOrDefaultAsync(c => c.AccountId == accountId);
    }
}