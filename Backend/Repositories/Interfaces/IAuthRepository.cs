using Microsoft.AspNetCore.Identity;
using RoomManagement.DTOs;
using RoomManagement.Models;


namespace RoomManagement.Services.Interfaces;

public interface IAuthRepository
{
    Task<IdentityResult> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto> RefreshTokenAsync(TokenRequestDto tokenRequestDto);
    Task<bool> LogoutAsync(TokenRequestDto tokenRequestDto);
}