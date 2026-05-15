using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces;

public interface IVoucherRepository
{
    Task<IEnumerable<Voucher>> GetSystemVouchersAsync();
    Task<IEnumerable<Voucher>> GetByHotelIdAsync(string hotelId);
    Task<IEnumerable<Voucher>> GetByCreatorIdAsync(string userId);
    Task<Voucher?> GetByIdAsync(string id);
    Task<Voucher?> GetByCodeAsync(string code);
    Task<Voucher> CreateAsync(Voucher voucher);
    Task<bool> DeleteAsync(string id);
    Task<Voucher> UpdateAsync(Voucher voucher);
}
