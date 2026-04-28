using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces
{
    public interface IVoucherService
    {
        Task<IEnumerable<VoucherDto>> GetActiveAsync();
        Task<VoucherDto?> GetByCodeAsync(string code);
        Task<VoucherDto> CreateAsync(VoucherDto dto);
        Task<bool> DeleteAsync(string id);
    }
}