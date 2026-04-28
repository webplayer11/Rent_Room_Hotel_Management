using Microsoft.EntityFrameworkCore;
using RoomManagement.Models;
using RoomManagement.Data;
using RoomManagement.Repositories.Interfaces;

namespace RoomManagement.Repositories.Implementations
{
    public class AccountRepository : GenericRepository<Account>, IAccountRepository
    {
        public AccountRepository(AppDbContext context) : base(context) { }

        public async Task<Account?> GetByEmailAsync(string email)
            => await _dbSet.AsNoTracking()
                           .FirstOrDefaultAsync(a => a.Email == email);

        public async Task<bool> EmailExistsAsync(string email)
            => await _dbSet.AnyAsync(a => a.Email == email);
    }
}