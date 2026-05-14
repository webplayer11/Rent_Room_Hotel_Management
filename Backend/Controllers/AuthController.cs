using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Repositories.Interfaces;

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

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        var result = await _authRepository.RegisterAsync(registerDto);
        if (result.Succeeded)
            return Ok(ResponseApi<string>.Success(null!, "Đăng ký thành công", 201));

        var errors = result.Errors.Select(e => e.Description).ToList();
        return BadRequest(ResponseApi<List<string>>.Failure(400, "Đăng ký thất bại", errors));
    }

    [HttpPost("upgrade-to-host")]
    [Authorize]
    public async Task<IActionResult> UpgradeToHost([FromBody] UpgradeToHostDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var result = await _authRepository.UpgradeToHostAsync(userId, dto);
        if (result.Succeeded)
            return Ok(ResponseApi<string>.Success(null!, "Nâng cấp tài khoản chủ nhà thành công", 200));

        var errors = result.Errors.Select(e => e.Description).ToList();
        return BadRequest(ResponseApi<List<string>>.Failure(400, "Nâng cấp chủ nhà thất bại", errors));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var result = await _authRepository.LoginAsync(loginDto);
        if (result == null)
            return Unauthorized(ResponseApi<string>.Failure(401, "Email hoặc mật khẩu không chính xác"));

        return Ok(ResponseApi<AuthResponseDto>.Success(result, "Đăng nhập thành công"));
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] TokenRequestDto tokenRequestDto)
    {
        var result = await _authRepository.RefreshTokenAsync(tokenRequestDto);
        if (result == null)
            return BadRequest(ResponseApi<string>.Failure(400, "Refresh Token không hợp lệ hoặc đã hết hạn"));

        return Ok(ResponseApi<AuthResponseDto>.Success(result, "Làm mới Token thành công"));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var result = await _authRepository.LogoutAsync(token);

        if (!result)
            return BadRequest(ResponseApi<string>.Failure(400, "Đăng xuất thất bại"));

        return Ok(ResponseApi<string>.Success(null!, "Đăng xuất thành công"));
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        var token = await _authRepository.ForgotPasswordAsync(forgotPasswordDto);
        if (token == null)
            return Ok(ResponseApi<string>.Success(null!, "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn"));

        return Ok(ResponseApi<object>.Success(new { resetToken = token }, "Token đặt lại mật khẩu đã được tạo (môi trường dev)"));
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
    {
        var result = await _authRepository.ResetPasswordAsync(resetPasswordDto);
        if (result.Succeeded)
            return Ok(ResponseApi<string>.Success(null!, "Đặt lại mật khẩu thành công"));

        var errors = result.Errors.Select(e => e.Description).ToList();
        return BadRequest(ResponseApi<List<string>>.Failure(400, "Đặt lại mật khẩu thất bại", errors));
    }
}
