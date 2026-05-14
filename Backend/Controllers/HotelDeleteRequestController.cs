using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Implementations;
using RoomManagement.Services.Interfaces;
using System.Security.Claims;

namespace RoomManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HotelDeleteRequestController : ControllerBase
    {
        private readonly IHotelDeleteRequestService _service;
        private readonly IHotelOwnerRepository _ownerRepo;

        public HotelDeleteRequestController(
            IHotelDeleteRequestService service,
            IHotelOwnerRepository ownerRepo)
        {
            _service = service;
            _ownerRepo = ownerRepo;
        }

        private string? GetCurrentOwnerId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier);

        // ── HotelOwner Endpoints ───────────────────────────────────────────

        [HttpPost]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Create([FromBody] CreateHotelDeleteRequestDto dto)
        {
            var ownerId = GetCurrentOwnerId();
            if (ownerId == null) return Unauthorized(ResponseApi<object>.Failure(401, "Không tìm thấy thông tin chủ khách sạn."));

            try
            {
                var result = await _service.CreateAsync(ownerId, dto);
                return Ok(ResponseApi<HotelDeleteRequestDto>.Success(result, "Gửi yêu cầu xóa thành công. Đang chờ duyệt."));
            }
            catch (Exception ex)
            {
                return BadRequest(ResponseApi<object>.Failure(400, ex.Message));
            }
        }

        [HttpGet("my-requests")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> GetMyRequests()
        {
            var ownerId = GetCurrentOwnerId();
            if (ownerId == null) return Unauthorized(ResponseApi<object>.Failure(401, "Không tìm thấy thông tin chủ khách sạn."));

            var result = await _service.GetByOwnerAsync(ownerId);
            return Ok(ResponseApi<IEnumerable<HotelDeleteRequestDto>>.Success(result));
        }

        [HttpPatch("{id}/cancel")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Cancel(string id)
        {
            var ownerId = GetCurrentOwnerId();
            if (ownerId == null) return Unauthorized(ResponseApi<object>.Failure(401, "Không tìm thấy thông tin chủ khách sạn."));

            var success = await _service.CancelAsync(id, ownerId);
            return success
                ? Ok(ResponseApi<object>.Success(null, "Hủy yêu cầu thành công."))
                : BadRequest(ResponseApi<object>.Failure(400, "Không thể hủy yêu cầu này."));
        }

        // ── Admin Endpoints ────────────────────────────────────────────────

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] string? status)
        {
            var result = await _service.GetAllAsync(status);
            return Ok(ResponseApi<IEnumerable<HotelDeleteRequestDto>>.Success(result));
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(string id)
        {
            var result = await _service.GetByIdAsync(id);
            return result == null
                ? NotFound(ResponseApi<object>.Failure(404, "Không tìm thấy yêu cầu."))
                : Ok(ResponseApi<HotelDeleteRequestDto>.Success(result));
        }

        [HttpGet("pending-count")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingCount()
        {
            var count = await _service.GetPendingCountAsync();
            return Ok(ResponseApi<int>.Success(count));
        }

        [HttpPatch("{id}/review")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Review(string id, [FromBody] ReviewHotelDeleteRequestDto dto)
        {
            var success = await _service.ReviewAsync(id, dto);
            return success
                ? Ok(ResponseApi<object>.Success(null, "Xử lý yêu cầu thành công."))
                : BadRequest(ResponseApi<object>.Failure(400, "Không thể xử lý yêu cầu này."));
        }
    }
}
