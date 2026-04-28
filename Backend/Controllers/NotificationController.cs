using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _service;

        public NotificationController(INotificationService service) => _service = service;

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(string customerId)
            => Ok(new ApiResponse<IEnumerable<NotificationDto>>(true, null,
                await _service.GetByCustomerAsync(customerId)));

        [HttpGet("customer/{customerId}/unread-count")]
        public async Task<IActionResult> GetUnreadCount(string customerId)
            => Ok(new ApiResponse<int>(true, null, await _service.GetUnreadCountAsync(customerId)));

        [HttpPatch("customer/{customerId}/mark-all-read")]
        public async Task<IActionResult> MarkAllRead(string customerId)
        {
            await _service.MarkAllAsReadAsync(customerId);
            return Ok(new ApiResponse<object>(true, "Đã đánh dấu tất cả là đã đọc.", null));
        }

        [HttpPost]
        public async Task<IActionResult> Send([FromBody] NotificationDto dto)
        {
            var result = await _service.SendAsync(dto);
            return Ok(new ApiResponse<NotificationDto>(true, "Gửi thông báo thành công.", result));
        }
    }
}