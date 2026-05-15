using RoomManagement.DTOs;
using Microsoft.AspNetCore.Identity;

namespace RoomManagement.Repositories.Interfaces;

public interface IAuthRepository
{
    Task<IdentityResult> RegisterAsync(RegisterDto registerDto);
    Task<bool> UpgradeToHostAsync(string userId, UpgradeToHostDto dto, string businessLicenseUrlsJson);
    Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto?> RefreshTokenAsync(TokenRequestDto tokenRequestDto);
    Task<bool> LogoutAsync(string token);
    Task<string?> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
    Task<IdentityResult> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
}
