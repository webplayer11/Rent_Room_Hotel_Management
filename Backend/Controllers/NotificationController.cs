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
            => Ok(ResponseApi<IEnumerable<NotificationDto>>.Success(await _service.GetByCustomerAsync(customerId)));

        [HttpGet("customer/{customerId}/unread-count")]
        public async Task<IActionResult> GetUnreadCount(string customerId)
            => Ok(ResponseApi<int>.Success(await _service.GetUnreadCountAsync(customerId)));

        [HttpPatch("customer/{customerId}/mark-all-read")]
        public async Task<IActionResult> MarkAllRead(string customerId)
        {
            await _service.MarkAllAsReadAsync(customerId);
            return Ok(ResponseApi<object>.Success(null, "Đã đánh dấu tất cả là đã đọc."));
        }

        [HttpPost]
        public async Task<IActionResult> Send([FromBody] NotificationDto dto)
        {
            var result = await _service.SendAsync(dto);
            return Ok(ResponseApi<NotificationDto>.Success(result, "Gửi thông báo thành công."));
        }
    }
}