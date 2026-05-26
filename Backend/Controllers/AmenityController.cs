using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoomManagement.Data;
using RoomManagement.DTOs;

namespace RoomManagement.Controllers;

[ApiController]
[Route("api/amenities")]
public class AmenityController : ControllerBase
{
    private readonly AppDbContext _context;

    public AmenityController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy danh sách tất cả các tiện ích của Khách sạn (Hotel)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetHotelAmenities()
    {
        var amenities = await _context.Amenities
            .OrderBy(a => a.Name)
            .Select(a => new AmenityDto
            {
                Id = a.Id,
                Name = a.Name,
                Icon = a.Icon,
                Category = a.Category
            })
            .ToListAsync();

        return Ok(new ResponseApi<IEnumerable<AmenityDto>> 
        { 
            IsSuccess = true, 
            Data = amenities,
            Message = "Thành công",
            Code = 200
        });
    }

    /// <summary>
    /// Lấy danh sách tất cả các tiện ích của Phòng (Room)
    /// </summary>
    [HttpGet("room")]
    public async Task<IActionResult> GetRoomAmenities()
    {
        var roomAmenities = await _context.RoomAmenities
            .OrderBy(a => a.Name)
            .Select(a => new RoomAmenityDto
            {
                Id = a.Id,
                Name = a.Name,
                Icon = a.Icon
            })
            .ToListAsync();

        return Ok(new ResponseApi<IEnumerable<RoomAmenityDto>> 
        { 
            IsSuccess = true, 
            Data = roomAmenities,
            Message = "Thành công",
            Code = 200
        });
    }
}
