using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase 
{
    private readonly IAuthRepository _authRepository;
    
    public AuthController(IAuthRepository authRepository)
    {
        _authRepository = authRepository;
    }

    //đăng kí
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto registerDto)
    {
        try
        {
            var result = await _authRepository.RegisterAsync(registerDto);
            if (result.Succeeded)
                return Ok(ResponseApi<string>.Success("null","Success",201));
            return BadRequest(401);

        }
        catch (Exception)
        {
            return StatusCode(500);
        }
    }

    //đăng nhập
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        var result = await _authRepository.LoginAsync(loginDto);
        if (result == null)
        {
            return BadRequest(ResponseApi<AuthResponseDto>.Failure(400, "Email hoặc mật khẩu không chính xác"));
        }
        
        return Ok(ResponseApi<AuthResponseDto>.Success(result));
    }

    //đăng xuất
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var token = Request.Headers["Authorization"]
            .ToString()
            .Replace("Bearer ", "");
        var result = await _authRepository.LogoutAsync(token);
        if (!result)
            return  BadRequest(ResponseApi<AuthResponseDto>.Failure(400,"Đăng xuất thất bại!"));
        
        return Ok(ResponseApi<AuthResponseDto>.Success(null));
    }

    //làm mới token
    [HttpPost("refreshtoken")]
    [Authorize]
    public async Task<IActionResult> RefeshToken(TokenRequestDto  tokenRequestDto)
    {
        var result = await _authRepository.RefreshTokenAsync(tokenRequestDto);
        if (result == null)
        {
            return BadRequest(ResponseApi<string>.Failure(400,"RefeshToken Failed"));
        }
        return  Ok(ResponseApi<AuthResponseDto>.Success(result));
    }
}