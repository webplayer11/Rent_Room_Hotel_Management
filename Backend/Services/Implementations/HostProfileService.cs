using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations;

public class HostProfileService : IHostProfileService
{
    private readonly IHostProfileRepository _repository;

    public HostProfileService(IHostProfileRepository repository)
    {
        _repository = repository;
    }

    public async Task<HostProfileDto?> GetProfileAsync(string userId)
    {
        var profile = await _repository.GetByIdAsync(userId);
        if (profile == null) return null;

        return MapToDto(profile);
    }

    public async Task<HostProfileDto?> UpdateProfileAsync(string userId, UpdateHostProfileDto dto)
    {
        var profile = await _repository.GetByIdAsync(userId);
        if (profile == null) return null;

        profile.CompanyName = dto.CompanyName ?? profile.CompanyName;
        profile.TaxCode = dto.TaxCode ?? profile.TaxCode;
        profile.BankAccount = dto.BankAccount ?? profile.BankAccount;
        profile.BankName = dto.BankName ?? profile.BankName;

        var updated = await _repository.UpdateAsync(profile);

        return MapToDto(updated!);
    }

    public async Task<IEnumerable<HostProfileDto>> GetHostsByStatusAsync(bool isVerified)
    {
        var hosts = await _repository.GetHostsByStatusAsync(isVerified);
        return hosts.Select(MapToDto);
    }

    public async Task<bool> ApproveHostAsync(string hostId)
    {
        var profile = await _repository.GetByIdAsync(hostId);
        if (profile == null) return false;

        profile.IsVerified = true;
        await _repository.UpdateAsync(profile);
        return true;
    }

    private static HostProfileDto MapToDto(HostProfile profile)
    {
        return new HostProfileDto
        {
            Id = profile.Id,
            CompanyName = profile.CompanyName,
            TaxCode = profile.TaxCode,
            BankAccount = profile.BankAccount,
            BankName = profile.BankName,
            IsVerified = profile.IsVerified,
            BusinessLicenseUrls = profile.BusinessLicenseUrls,
            Email = profile.User?.Email,
            FullName = profile.User?.FullName,
            PhoneNumber = profile.User?.PhoneNumber,
            CreatedAt = profile.CreatedAt
        };
    }
}
