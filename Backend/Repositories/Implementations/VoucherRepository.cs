using Microsoft.EntityFrameworkCore;
using RoomManagement.Data;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;

namespace RoomManagement.Repositories.Implementations;

public class VoucherRepository : IVoucherRepository
{
    private readonly AppDbContext _context;

    public VoucherRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Voucher>> GetSystemVouchersAsync()
    {
        return await _context.Vouchers
            .Where(v => v.HotelId == null && v.IsActive)
            .OrderByDescending(v => v.StartDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Voucher>> GetByHotelIdAsync(string hotelId)
    {
        return await _context.Vouchers
            .Where(v => v.HotelId == hotelId && v.IsActive)
            .OrderByDescending(v => v.StartDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Voucher>> GetByCreatorIdAsync(string userId)
    {
        return await _context.Vouchers
            .Where(v => v.CreatedByUserId == userId)
            .OrderByDescending(v => v.StartDate)
            .ToListAsync();
    }

    public async Task<Voucher?> GetByIdAsync(string id)
    {
        return await _context.Vouchers.FindAsync(id);
    }

    public async Task<Voucher?> GetByCodeAsync(string code)
    {
        return await _context.Vouchers
            .FirstOrDefaultAsync(v => v.Code == code);
    }

    public async Task<Voucher> CreateAsync(Voucher voucher)
    {
        voucher.Id = Guid.NewGuid().ToString();
        _context.Vouchers.Add(voucher);
        await _context.SaveChangesAsync();
        return voucher;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var voucher = await _context.Vouchers.FindAsync(id);
        if (voucher == null) return false;

        _context.Vouchers.Remove(voucher);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Voucher> UpdateAsync(Voucher voucher)
    {
        _context.Vouchers.Update(voucher);
        await _context.SaveChangesAsync();
        return voucher;
    }
}
