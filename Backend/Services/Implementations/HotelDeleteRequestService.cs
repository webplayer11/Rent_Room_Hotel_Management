using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations
{
    public class HotelDeleteRequestService : IHotelDeleteRequestService
    {
        private readonly IHotelDeleteRequestRepository _repo;
        private readonly IHotelRepository _hotelRepo;
        private readonly INotificationService _notificationService;

        public HotelDeleteRequestService(
            IHotelDeleteRequestRepository repo,
            IHotelRepository hotelRepo,
            INotificationService notificationService)
        {
            _repo = repo;
            _hotelRepo = hotelRepo;
            _notificationService = notificationService;
        }

        public async Task<HotelDeleteRequestDto> CreateAsync(string ownerId, CreateHotelDeleteRequestDto dto)
        {
            var hotel = await _hotelRepo.GetByIdAsync(dto.HotelId);
            if (hotel == null) throw new KeyNotFoundException("Không tìm thấy khách sạn.");
            if (hotel.OwnerId != ownerId) throw new UnauthorizedAccessException("Bạn không có quyền yêu cầu xóa khách sạn này.");

            var hasPending = await _repo.HasPendingRequestAsync(dto.HotelId);
            if (hasPending) throw new InvalidOperationException("Đã có yêu cầu xóa đang chờ duyệt cho khách sạn này.");

            var entity = new HotelDeleteRequest
            {
                Id = Guid.NewGuid().ToString("N")[..10].ToUpper(),
                HotelId = dto.HotelId,
                OwnerId = ownerId,
                Reason = dto.Reason,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            var result = await _repo.CreateAsync(entity);

            // Notify Admin (conceptually, depends on INotificationService implementation)
            // await _notificationService.SendToAdminAsync("Yêu cầu xóa khách sạn mới", $"Khách sạn {hotel.Name} yêu cầu xóa.");

            return MapToDto(result);
        }

        public async Task<IEnumerable<HotelDeleteRequestDto>> GetByOwnerAsync(string ownerId)
            => (await _repo.GetByOwnerIdAsync(ownerId)).Select(MapToDto);

        public async Task<IEnumerable<HotelDeleteRequestDto>> GetAllAsync(string? status)
        {
            var requests = status != null
                ? await _repo.GetByStatusAsync(status)
                : await _repo.GetAllAsync();
            return requests.Select(MapToDto);
        }

        public async Task<HotelDeleteRequestDto?> GetByIdAsync(string id)
        {
            var result = await _repo.GetWithDetailsAsync(id);
            return result == null ? null : MapToDto(result);
        }

        public async Task<int> GetPendingCountAsync() => await _repo.CountPendingAsync();

        public async Task<bool> ReviewAsync(string id, ReviewHotelDeleteRequestDto dto)
        {
            var entity = await _repo.GetWithDetailsAsync(id);
            if (entity == null || entity.Status != "Pending") return false;

            entity.Status = dto.Decision;
            entity.AdminNote = dto.AdminNote;
            entity.UpdatedAt = DateTime.UtcNow;

            await _repo.UpdateAsync(entity);

            if (dto.Decision == "Approved")
            {
                await _hotelRepo.DeleteAsync(entity.HotelId);
                // Notify Owner
                // await _notificationService.SendToCustomerAsync(entity.OwnerId, "Yêu cầu xóa khách sạn đã được duyệt", "Khách sạn của bạn đã bị xóa khỏi hệ thống.");
            }
            else if (dto.Decision == "Rejected")
            {
                // Notify Owner
                // await _notificationService.SendToCustomerAsync(entity.OwnerId, "Yêu cầu xóa khách sạn đã bị từ chối", $"Lý do: {dto.AdminNote}");
            }

            return true;
        }

        public async Task<bool> CancelAsync(string id, string ownerId)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null || entity.OwnerId != ownerId || entity.Status != "Pending") return false;

            entity.Status = "Cancelled";
            entity.UpdatedAt = DateTime.UtcNow;
            await _repo.UpdateAsync(entity);
            return true;
        }

        private static HotelDeleteRequestDto MapToDto(HotelDeleteRequest r) => new(
            r.Id,
            r.HotelId,
            r.Hotel?.Name ?? "N/A",
            r.OwnerId,
            r.Owner?.CompanyName ?? "N/A",
            r.Reason,
            r.Status,
            r.AdminNote,
            r.CreatedAt,
            r.UpdatedAt);
    }
}
