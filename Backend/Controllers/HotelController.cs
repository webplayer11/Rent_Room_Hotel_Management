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
[Route("api/hotels")]
public class HotelController : ControllerBase
{
    private readonly IHotelService _service;
    private readonly IStorageService _storageService;
    private readonly MinIOOptions _minioOptions;
    private readonly AppDbContext _context;

    public HotelController(
        IHotelService service,
        IStorageService storageService,
        IOptions<MinIOOptions> minioOptions,
        AppDbContext context)
    {
        _service = service;
        _storageService = storageService;
        _minioOptions = minioOptions.Value;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(ResponseApi<IEnumerable<HotelDto>>.Success(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy khách sạn"));
        return Ok(ResponseApi<HotelDto>.Success(result));
    }

    [HttpGet("my-hotels")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> GetMyHotels()
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.GetByHostIdAsync(hostId);
        return Ok(ResponseApi<IEnumerable<HotelDto>>.Success(result));
    }

    [HttpPost]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> Create([FromForm] CreateHotelDto dto, [FromForm] List<IFormFile>? Images)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.CreateAsync(hostId, dto);

        // Upload images nếu có
        if (Images != null && Images.Count > 0)
        {
            var uploadedImages = new List<HotelImage>();
            for (int i = 0; i < Images.Count; i++)
            {
                var file = Images[i];
                var objectKey = $"{result.Id}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{i}.webp";
                var relativePath = await _storageService.UploadAsync(file, _minioOptions.HotelBucketName, objectKey, 1280, 720);

                var image = new HotelImage
                {
                    Id = Guid.NewGuid().ToString(),
                    HotelId = result.Id,
                    Url = relativePath,
                    IsPrimary = i == 0, // Ảnh đầu tiên là ảnh chính
                    SortOrder = i
                };
                uploadedImages.Add(image);
            }

            _context.HotelImages.AddRange(uploadedImages);
            await _context.SaveChangesAsync();

            // Gắn danh sách ảnh vào response
            result.Images = uploadedImages.Select(img => new HotelImageDto
            {
                Id = img.Id,
                Url = img.Url,
                Caption = img.Caption,
                IsPrimary = img.IsPrimary,
                SortOrder = img.SortOrder
            }).ToList();
        }

        return Ok(ResponseApi<HotelDto>.Success(result, "Tạo khách sạn thành công", 201));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateHotelDto dto)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.UpdateAsync(hostId, id, dto);
        if (result == null) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy khách sạn hoặc bạn không có quyền"));

        return Ok(ResponseApi<HotelDto>.Success(result, "Cập nhật thành công"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> Delete(string id)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var result = await _service.DeleteAsync(hostId, id);
        if (!result) return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy khách sạn hoặc bạn không có quyền"));

        return Ok(ResponseApi<string>.Success(null!, "Xóa khách sạn thành công"));
    }

    [HttpPost("{id}/images")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> UploadImage(string id, IFormFile file)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var hotel = await _context.Hotels.FindAsync(id);
        if (hotel == null || hotel.HostId != hostId)
            return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy khách sạn hoặc bạn không có quyền"));

        var objectKey = $"{id}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}.webp";
        var relativePath = await _storageService.UploadAsync(file, _minioOptions.HotelBucketName, objectKey, 1280, 720);

        var image = new HotelImage
        {
            Id = Guid.NewGuid().ToString(),
            HotelId = id,
            Url = relativePath,
            IsPrimary = !_context.HotelImages.Any(hi => hi.HotelId == id)
        };

        _context.HotelImages.Add(image);
        await _context.SaveChangesAsync();

        return Ok(ResponseApi<object>.Success(new { image.Id, image.Url, image.IsPrimary }, "Upload ảnh thành công", 201));
    }

    [HttpDelete("{id}/images/{imageId}")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> DeleteImage(string id, string imageId)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (hostId == null) return Unauthorized();

        var hotel = await _context.Hotels.FindAsync(id);
        if (hotel == null || hotel.HostId != hostId)
            return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy khách sạn hoặc bạn không có quyền"));

        var image = await _context.HotelImages.FindAsync(imageId);
        if (image == null || image.HotelId != id)
            return NotFound(ResponseApi<string>.Failure(404, "Không tìm thấy ảnh"));

        if (!string.IsNullOrEmpty(image.Url))
            await _storageService.DeleteAsync(image.Url);

        _context.HotelImages.Remove(image);
        await _context.SaveChangesAsync();

        return Ok(ResponseApi<string>.Success(null!, "Xóa ảnh thành công"));
    }
}

