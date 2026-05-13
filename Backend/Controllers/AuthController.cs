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

    //yêu cầu đặt lại mật khẩu
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto forgotPasswordDto)
    {
        try
        {
            var token = await _authRepository.ForgotPasswordAsync(forgotPasswordDto);
            
        
            if (token == null)
            {
                return Ok(ResponseApi<string>.Success(null!, 
                    "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu."));
            }

            return Ok(ResponseApi<object>.Success(
                new { resetToken = token }, 
                "Token đặt lại mật khẩu đã được tạo thành công."));
        }
        catch (Exception)
        {
            return StatusCode(500, ResponseApi<string>.Failure(500, "Đã xảy ra lỗi khi xử lý yêu cầu."));
        }
    }

    //đặt lại mật khẩu
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto resetPasswordDto)
    {
        try
        {
            var result = await _authRepository.ResetPasswordAsync(resetPasswordDto);

            if (result.Succeeded)
            {
                return Ok(ResponseApi<string>.Success(null!, "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."));
            }
            var errors = result.Errors.Select(e => e.Description).ToList();
            return BadRequest(ResponseApi<List<string>>.Failure(400, 
                "Đặt lại mật khẩu thất bại.", errors));
        }
        catch (Exception)
        {
            return StatusCode(500, ResponseApi<string>.Failure(500, "Đã xảy ra lỗi khi xử lý yêu cầu."));
        }
    }
}