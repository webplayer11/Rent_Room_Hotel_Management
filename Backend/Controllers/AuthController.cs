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
        
        // Lưu token vào HttpOnly cookie
        if (!string.IsNullOrEmpty(result.Token))
        {
            Response.Cookies.Append("accessToken", result.Token, new Microsoft.AspNetCore.Http.CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddMinutes(15)
            });
        }

        // Lưu refresh token vào HttpOnly cookie
        if (!string.IsNullOrEmpty(result.RefreshToken))
        {
            Response.Cookies.Append("refreshToken", result.RefreshToken, new Microsoft.AspNetCore.Http.CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });
        }

        // Trả về response mà không chứa token (vì đã lưu trong cookie)
        return Ok(ResponseApi<object>.Success(null, "Đăng nhập thành công"));
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
            return BadRequest(ResponseApi<AuthResponseDto>.Failure(400, "Đăng xuất thất bại!"));
        
        // Xóa cookies
        Response.Cookies.Delete("accessToken");
        Response.Cookies.Delete("refreshToken");
        
        return Ok(ResponseApi<AuthResponseDto>.Success(null, "Đăng xuất thành công"));
    }

    //làm mới token
    [HttpPost("refreshtoken")]
    [Authorize]
    public async Task<IActionResult> RefeshToken(TokenRequestDto tokenRequestDto)
    {
        // Lấy refresh token từ cookie
        if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken) || string.IsNullOrEmpty(refreshToken))
        {
            return BadRequest(ResponseApi<string>.Failure(400, "Refresh token không tìm thấy"));
        }

        // Tạo TokenRequestDto với refresh token từ cookie
        var tokenRequest = new TokenRequestDto
        {
            AccessToken = tokenRequestDto.AccessToken,
            RefreshToken = refreshToken
        };

        var result = await _authRepository.RefreshTokenAsync(tokenRequest);
        if (result == null)
        {
            return BadRequest(ResponseApi<string>.Failure(400, "Refresh token không hợp lệ hoặc đã hết hạn"));
        }

        // Cập nhật access token trong cookie
        if (!string.IsNullOrEmpty(result.Token))
        {
            Response.Cookies.Append("accessToken", result.Token, new Microsoft.AspNetCore.Http.CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddMinutes(15)
            });
        }

        // Cập nhật refresh token trong cookie
        if (!string.IsNullOrEmpty(result.RefreshToken))
        {
            Response.Cookies.Append("refreshToken", result.RefreshToken, new Microsoft.AspNetCore.Http.CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });
        }

        return Ok(ResponseApi<object>.Success(null, "Token đã được làm mới"));
    }
}