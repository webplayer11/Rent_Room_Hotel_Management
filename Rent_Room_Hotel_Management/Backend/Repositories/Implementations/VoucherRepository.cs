using Microsoft.EntityFrameworkCore;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Data;

namespace RoomManagement.Repositories.Implementations
{
    public class VoucherRepository : GenericRepository<Voucher>, IVoucherRepository
    {
        public VoucherRepository(AppDbContext context) : base(context) { }

        public async Task<Voucher?> GetByCodeAsync(string code)
            => await _dbSet.AsNoTracking()
                           .FirstOrDefaultAsync(v => v.Code == code);

        public async Task<IEnumerable<Voucher>> GetActiveVouchersAsync()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            return await _dbSet.AsNoTracking()
                               .Where(v => v.StartDate <= today && v.EndDate >= today)
                               .ToListAsync();
        }
    }
}