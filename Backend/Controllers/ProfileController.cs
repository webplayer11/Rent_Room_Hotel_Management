using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Models; // 👈 QUAN TRỌNG

namespace RoomManagement.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IAuthRepository _authRepository;

    public ProfileController(IAuthRepository authRepository)
    {
        _authRepository = authRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var profile = await _authRepository.GetProfileAsync(userId!);

        if (profile == null)
            return NotFound();

        return Ok(ResponseApi<UserProfileDto>.Success(profile));
    }

    [HttpPatch]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var result = await _authRepository.UpdateProfileAsync(userId!, dto);

        if (!result)
            return BadRequest(ResponseApi<string>.Failure(400, "Cập nhật thất bại"));

        return Ok(ResponseApi<string>.Success(null!, "Cập nhật thành công"));
    }
}