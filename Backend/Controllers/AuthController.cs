using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthRepository _authRepository;
    private readonly IStorageService _storageService;
    private readonly MinIOOptions _minioOptions;

    public AuthController(
        IAuthRepository authRepository,
        IStorageService storageService,
        IOptions<MinIOOptions> minioOptions)
    {
        _authRepository = authRepository;
        _storageService = storageService;
        _minioOptions = minioOptions.Value;
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
    public async Task<IActionResult> UpgradeToHost([FromForm] UpgradeToHostDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        if (dto.BusinessLicenses == null || !dto.BusinessLicenses.Any())
        {
            return BadRequest(ResponseApi<string>.Failure(400, "Vui lòng cung cấp ít nhất một ảnh giấy phép kinh doanh"));
        }

        var uploadedUrls = new List<string>();
        try
        {
            foreach (var file in dto.BusinessLicenses)
            {
                if (file.Length > 0)
                {
                    var objectKey = $"host_{userId}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}_{Guid.NewGuid()}.webp";
                    var relativePath = await _storageService.UploadAsync(
                        file,
                        _minioOptions.HostDocumentBucketName,
                        objectKey,
                        1280, 720);
                    uploadedUrls.Add(relativePath);
                }
            }
        }
        catch (Exception)
        {
            foreach (var url in uploadedUrls) await _storageService.DeleteAsync(url);
            return BadRequest(ResponseApi<string>.Failure(400, "Lỗi khi tải ảnh lên hệ thống"));
        }

        var businessLicenseUrlsJson = System.Text.Json.JsonSerializer.Serialize(uploadedUrls);

        var result = await _authRepository.UpgradeToHostAsync(userId, dto, businessLicenseUrlsJson);
        if (result)
            return Ok(ResponseApi<string>.Success(null!, "Yêu Cầu nâng cấp tài khoản chủ nhà thành công", 200));

        // Delete uploaded files if upgrade fails
        foreach (var url in uploadedUrls)
        {
            await _storageService.DeleteAsync(url);
        }

        return BadRequest(ResponseApi<string>.Failure(400, "Yêu Cầu Nâng cấp chủ nhà thất bại"));
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