using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using RoomManagement.Data;
using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers;

[ApiController]
[Route("api/rooms")]
public class RoomController : ControllerBase
{
    private readonly IRoomService _service;
    private readonly IStorageService _storageService;
    private readonly MinIOOptions _minioOptions;
    private readonly AppDbContext _context;

    public RoomController(
        IRoomService service,
        IStorageService storageService,
        IOptions<MinIOOptions> minioOptions,
        AppDbContext context)
    {
        _service = service;
        _storageService = storageService;
        _minioOptions = minioOptions.Value;
        _context = context;
    }

    [HttpGet("hotel/{hotelId}")]
    public async Task<IActionResult> GetByHotelId(string hotelId)
    {
        var result = await _service.GetByHotelIdAsync(hotelId);
        return Ok(ResponseApi<IEnumerable<RoomDto>>.Success(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy phòng"));
        return Ok(ResponseApi<RoomDto>.Success(result));
    }

    [HttpPost]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> Create([FromForm] CreateRoomDto dto, [FromForm] List<IFormFile>? Images)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.CreateAsync(hostId, dto);
        if (result == null) return BadRequest(ResponseApi<string>.Failure(400, "Không thể tạo phòng, vui lòng kiểm tra quyền sở hữu khách sạn"));

        // Upload images nếu có
        if (Images != null && Images.Count > 0)
        {
            var uploadedImages = new List<RoomImage>();
            for (int i = 0; i < Images.Count; i++)
            {
                var file = Images[i];
                var objectKey = $"{result.Id}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{i}.webp";
                var relativePath = await _storageService.UploadAsync(file, _minioOptions.RoomBucketName, objectKey, 1280, 720);

                var image = new RoomImage
                {
                    Id = Guid.NewGuid().ToString(),
                    RoomId = result.Id,
                    Url = relativePath,
                    SortOrder = i
                };
                uploadedImages.Add(image);
            }

            _context.RoomImages.AddRange(uploadedImages);
            await _context.SaveChangesAsync();

            // Gắn danh sách ảnh vào response
            result.Images = uploadedImages.Select(img => new RoomImageDto
            {
                Id = img.Id,
                Url = img.Url,
                Caption = img.Caption,
                SortOrder = img.SortOrder
            }).ToList();
        }

        return Ok(ResponseApi<RoomDto>.Success(result, "Tạo phòng thành công", 201));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> Update(string id, [FromBody] CreateRoomDto dto)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.UpdateAsync(hostId, id, dto);
        if (result == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy phòng hoặc bạn không có quyền"));

        return Ok(ResponseApi<RoomDto>.Success(result, "Cập nhật thành công"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> Delete(string id)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.DeleteAsync(hostId, id);
        if (!result) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy phòng hoặc bạn không có quyền"));

        return Ok(ResponseApi<string>.Success(null!, "Xóa phòng thành công"));
    }

    // ── Image Upload ──────────────────────────────────────────────

    [HttpPost("{id}/images")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> UploadImage(string id, IFormFile file)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var room = await _context.Rooms.FindAsync(id);
        if (room == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy phòng"));

        // Verify host owns this room's hotel
        var hotel = await _context.Hotels.FindAsync(room.HotelId);
        if (hotel == null || hotel.HostId != hostId)
            return BadRequest(ResponseApi<string>.Failure(403, "Bạn không có quyền upload ảnh cho phòng này"));

        var objectKey = $"{id}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}.webp";
        var relativePath = await _storageService.UploadAsync(file, _minioOptions.RoomBucketName, objectKey, 1280, 720);

        var image = new RoomImage
        {
            Id = Guid.NewGuid().ToString(),
            RoomId = id,
            Url = relativePath
        };

        _context.RoomImages.Add(image);
        await _context.SaveChangesAsync();

        return Ok(ResponseApi<object>.Success(new { image.Id, image.Url }, "Upload ảnh phòng thành công", 201));
    }

    [HttpDelete("{id}/images/{imageId}")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> DeleteImage(string id, string imageId)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var room = await _context.Rooms.FindAsync(id);
        if (room == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy phòng"));

        var hotel = await _context.Hotels.FindAsync(room.HotelId);
        if (hotel == null || hotel.HostId != hostId)
            return BadRequest(ResponseApi<string>.Failure(403, "Bạn không có quyền"));

        var image = await _context.RoomImages.FindAsync(imageId);
        if (image == null || image.RoomId != id)
            return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy ảnh"));

        if (!string.IsNullOrEmpty(image.Url))
            await _storageService.DeleteAsync(image.Url);

        _context.RoomImages.Remove(image);
        await _context.SaveChangesAsync();

        return Ok(ResponseApi<string>.Success(null!, "Xóa ảnh phòng thành công"));
    }
}

