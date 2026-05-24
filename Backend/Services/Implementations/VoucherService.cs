using AutoMapper;
using Microsoft.EntityFrameworkCore;
using RoomManagement.Data;
using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations;

public class VoucherService : IVoucherService
{
    private readonly IVoucherRepository _repository;
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public VoucherService(IVoucherRepository repository, AppDbContext context, IMapper mapper)
    {
        _repository = repository;
        _context = context;
        _mapper = mapper;
    }

    // ── System Vouchers (Admin) ──────────────────────────────────

    public async Task<VoucherDto> CreateSystemVoucherAsync(string adminUserId, CreateSystemVoucherDto dto)
    {
        var voucher = new Voucher
        {
            Code = dto.Code.ToUpper(),
            Type = dto.Type,
            DiscountValue = dto.DiscountValue,
            MaxDiscountAmount = dto.MaxDiscountAmount,
            MinOrderAmount = dto.MinOrderAmount,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            UsageLimit = dto.UsageLimit,
            HotelId = null, // System-wide
            CreatedByUserId = adminUserId
        };

        var created = await _repository.CreateAsync(voucher);
        return _mapper.Map<VoucherDto>(created);
    }

    public async Task<IEnumerable<VoucherDto>> GetSystemVouchersAsync()
    {
        var vouchers = await _repository.GetSystemVouchersAsync();
        return _mapper.Map<IEnumerable<VoucherDto>>(vouchers);
    }

    // ── Hotel Vouchers (Host) ────────────────────────────────────

    public async Task<VoucherDto?> CreateHotelVoucherAsync(string hostUserId, CreateHotelVoucherDto dto)
    {
        // Verify host owns this hotel
        var hotel = await _context.Hotels.FindAsync(dto.HotelId);
        if (hotel == null || hotel.HostId != hostUserId) return null;

        var voucher = new Voucher
        {
            Code = dto.Code.ToUpper(),
            Type = dto.Type,
            DiscountValue = dto.DiscountValue,
            MaxDiscountAmount = dto.MaxDiscountAmount,
            MinOrderAmount = dto.MinOrderAmount,
            MinNights = dto.MinNights,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            UsageLimit = dto.UsageLimit,
            HotelId = dto.HotelId,
            CreatedByUserId = hostUserId
        };

        var created = await _repository.CreateAsync(voucher);
        return _mapper.Map<VoucherDto>(created);
    }

    public async Task<IEnumerable<VoucherDto>> GetHotelVouchersAsync(string hotelId)
    {
        var vouchers = await _repository.GetByHotelIdAsync(hotelId);
        return _mapper.Map<IEnumerable<VoucherDto>>(vouchers);
    }

    public async Task<IEnumerable<VoucherDto>> GetMyVouchersAsync(string userId)
    {
        var vouchers = await _repository.GetByCreatorIdAsync(userId);
        return _mapper.Map<IEnumerable<VoucherDto>>(vouchers);
    }

    // ── Common ───────────────────────────────────────────────────

    public async Task<VoucherStatsDto?> GetVoucherStatsAsync(string voucherId)
    {
        var voucher = await _repository.GetByIdAsync(voucherId);
        if (voucher == null) return null;

        // Tính tổng discount đã giảm cho các booking dùng voucher này
        var totalDiscount = await _context.Bookings
            .Where(b => b.VoucherId == voucherId && b.DiscountAmount.HasValue)
            .SumAsync(b => b.DiscountAmount!.Value);

        return new VoucherStatsDto
        {
            Id = voucher.Id,
            Code = voucher.Code,
            UsageLimit = voucher.UsageLimit,
            UsedCount = voucher.UsedCount,
            RemainingUses = voucher.UsageLimit - voucher.UsedCount,
            TotalDiscountGiven = totalDiscount
        };
    }

    public async Task<bool> DeleteVoucherAsync(string userId, string voucherId)
    {
        var voucher = await _repository.GetByIdAsync(voucherId);
        if (voucher == null) return false;

        // Chỉ người tạo hoặc Admin mới có thể xóa (controller kiểm tra role)
        if (voucher.CreatedByUserId != userId)
        {
            // Nếu không phải người tạo, kiểm tra xem có phải admin không (để controller xử lý)
            return false;
        }

        return await _repository.DeleteAsync(voucherId);
    }

    public async Task<ValidateVoucherDto> ValidateVoucherAsync(string code)
    {
        var voucher = await _repository.GetByCodeAsync(code.ToUpper());

        if (voucher == null)
            return new ValidateVoucherDto { Code = code, IsValid = false, Message = "Mã voucher không tồn tại" };

        if (!voucher.IsActive)
            return new ValidateVoucherDto { Code = code, IsValid = false, Message = "Voucher đã bị vô hiệu hóa" };

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (today < voucher.StartDate || today > voucher.EndDate)
            return new ValidateVoucherDto { Code = code, IsValid = false, Message = "Voucher không trong thời gian hiệu lực" };

        if (voucher.UsedCount >= voucher.UsageLimit)
            return new ValidateVoucherDto { Code = code, IsValid = false, Message = "Voucher đã hết lượt sử dụng" };

        return new ValidateVoucherDto
        {
            Code = code,
            IsValid = true,
            Message = "Voucher hợp lệ",
            Voucher = _mapper.Map<VoucherDto>(voucher)
        };
    }


}
