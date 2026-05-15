using RoomManagement.DTOs;

namespace RoomManagement.Services.Interfaces;

public interface IVoucherService
{
    // System vouchers (Admin)
    Task<VoucherDto> CreateSystemVoucherAsync(string adminUserId, CreateSystemVoucherDto dto);
    Task<IEnumerable<VoucherDto>> GetSystemVouchersAsync();

    // Hotel vouchers (Host)
    Task<VoucherDto?> CreateHotelVoucherAsync(string hostUserId, CreateHotelVoucherDto dto);
    Task<IEnumerable<VoucherDto>> GetHotelVouchersAsync(string hotelId);
    Task<IEnumerable<VoucherDto>> GetMyVouchersAsync(string userId);

    // Common
    Task<VoucherStatsDto?> GetVoucherStatsAsync(string voucherId);
    Task<bool> DeleteVoucherAsync(string userId, string voucherId);
    Task<ValidateVoucherDto> ValidateVoucherAsync(string code);
}
