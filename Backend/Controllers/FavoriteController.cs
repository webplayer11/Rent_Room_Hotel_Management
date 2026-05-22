using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers;

[ApiController]
[Route("api/favorites")]
[Authorize]
public class FavoriteController : ControllerBase
{
    private readonly IFavoriteService _service;

    public FavoriteController(IFavoriteService service)
    {
        _service = service;
    }

    [HttpPost("{hotelId}")]
    public async Task<IActionResult> ToggleFavorite(string hotelId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var isAdded = await _service.ToggleFavoriteAsync(userId, hotelId);
        var message = isAdded ? "Đã thêm vào danh sách yêu thích" : "Đã xóa khỏi danh sách yêu thích";
        
        return Ok(ResponseApi<object>.Success(new { isFavorited = isAdded }, message));
    }

    [HttpGet]
    public async Task<IActionResult> GetMyFavorites()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var favorites = await _service.GetFavoritesAsync(userId);
        return Ok(ResponseApi<IEnumerable<SearchHotelResponseDto>>.Success(favorites));
    }

    [HttpGet("{hotelId}/status")]
    public async Task<IActionResult> CheckFavoriteStatus(string hotelId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var isFavorited = await _service.IsFavoritedAsync(userId, hotelId);
        return Ok(ResponseApi<object>.Success(new { isFavorited }));
    }
}
