using AutoMapper;
using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations;

public class HostProfileService : IHostProfileService
{
    private readonly IHostProfileRepository _repository;
    private readonly IMapper _mapper;

    public HostProfileService(IHostProfileRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<HostProfileDto?> GetProfileAsync(string userId)
    {
        var profile = await _repository.GetByIdAsync(userId);
        if (profile == null) return null;

        return _mapper.Map<HostProfileDto>(profile);
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

        return _mapper.Map<HostProfileDto>(updated!);
    }

    public async Task<IEnumerable<HostProfileDto>> GetHostsByStatusAsync(bool isVerified)
    {
        var hosts = await _repository.GetHostsByStatusAsync(isVerified);
        return _mapper.Map<IEnumerable<HostProfileDto>>(hosts);
    }

    public async Task<bool> ApproveHostAsync(string hostId)
    {
        var profile = await _repository.GetByIdAsync(hostId);
        if (profile == null) return false;

        profile.IsVerified = true;
        await _repository.UpdateAsync(profile);
        return true;
    }
}
