using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations
{
    public class VoucherService : IVoucherService
    {
        private readonly IVoucherRepository _repo;

        public VoucherService(IVoucherRepository repo) => _repo = repo;

        public async Task<IEnumerable<VoucherDto>> GetActiveAsync()
            => (await _repo.GetActiveVouchersAsync()).Select(MapToDto);

        public async Task<VoucherDto?> GetByCodeAsync(string code)
        {
            var v = await _repo.GetByCodeAsync(code);
            return v is null ? null : MapToDto(v);
        }

        public async Task<VoucherDto> CreateAsync(VoucherDto dto)
        {
            var entity = new Voucher
            {
                Id = dto.Id,
                Code = dto.Code,
                Type = dto.Type,
                DiscountValue = dto.DiscountValue,
                MinOrderAmount = dto.MinOrderAmount,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                UsageLimit = dto.UsageLimit
            };
            return MapToDto(await _repo.CreateAsync(entity));
        }

        public Task<bool> DeleteAsync(string id) => _repo.DeleteAsync(id);

        private static VoucherDto MapToDto(Voucher v) => new(
            v.Id, v.Code, v.Type, v.DiscountValue,
            v.MinOrderAmount, v.StartDate, v.EndDate, v.UsageLimit);
    }
}