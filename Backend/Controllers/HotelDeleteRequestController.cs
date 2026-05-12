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

        private async Task<string?> GetCurrentOwnerId()
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (accountId == null) return null;
            var owner = await _ownerRepo.GetByAccountIdAsync(accountId);
            return owner?.Id;
        }

        // ── HotelOwner Endpoints ───────────────────────────────────────────

        [HttpPost]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Create([FromBody] CreateHotelDeleteRequestDto dto)
        {
            var ownerId = await GetCurrentOwnerId();
            if (ownerId == null) return Unauthorized(new ApiResponse<object>(false, "Không tìm thấy thông tin chủ khách sạn.", null));

            try
            {
                var result = await _service.CreateAsync(ownerId, dto);
                return Ok(new ApiResponse<HotelDeleteRequestDto>(true, "Gửi yêu cầu xóa thành công. Đang chờ duyệt.", result));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>(false, ex.Message, null));
            }
        }

        [HttpGet("my-requests")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> GetMyRequests()
        {
            var ownerId = await GetCurrentOwnerId();
            if (ownerId == null) return Unauthorized(new ApiResponse<object>(false, "Không tìm thấy thông tin chủ khách sạn.", null));

            var result = await _service.GetByOwnerAsync(ownerId);
            return Ok(new ApiResponse<IEnumerable<HotelDeleteRequestDto>>(true, null, result));
        }

        [HttpPatch("{id}/cancel")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Cancel(string id)
        {
            var ownerId = await GetCurrentOwnerId();
            if (ownerId == null) return Unauthorized(new ApiResponse<object>(false, "Không tìm thấy thông tin chủ khách sạn.", null));

            var success = await _service.CancelAsync(id, ownerId);
            return success
                ? Ok(new ApiResponse<object>(true, "Hủy yêu cầu thành công.", null))
                : BadRequest(new ApiResponse<object>(false, "Không thể hủy yêu cầu này.", null));
        }

        // ── Admin Endpoints ────────────────────────────────────────────────

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] string? status)
        {
            var result = await _service.GetAllAsync(status);
            return Ok(new ApiResponse<IEnumerable<HotelDeleteRequestDto>>(true, null, result));
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(string id)
        {
            var result = await _service.GetByIdAsync(id);
            return result == null
                ? NotFound(new ApiResponse<object>(false, "Không tìm thấy yêu cầu.", null))
                : Ok(new ApiResponse<HotelDeleteRequestDto>(true, null, result));
        }

        [HttpGet("pending-count")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingCount()
        {
            var count = await _service.GetPendingCountAsync();
            return Ok(new ApiResponse<int>(true, null, count));
        }

        [HttpPatch("{id}/review")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Review(string id, [FromBody] ReviewHotelDeleteRequestDto dto)
        {
            var success = await _service.ReviewAsync(id, dto);
            return success
                ? Ok(new ApiResponse<object>(true, "Xử lý yêu cầu thành công.", null))
                : BadRequest(new ApiResponse<object>(false, "Không thể xử lý yêu cầu này.", null));
        }
    }
}
