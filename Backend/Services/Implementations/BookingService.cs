using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepo;
        private readonly IRoomRepository _roomRepo;

        public BookingService(IBookingRepository bookingRepo, IRoomRepository roomRepo)
        {
            _bookingRepo = bookingRepo;
            _roomRepo = roomRepo;
        }

        public async Task<IEnumerable<BookingDto>> GetByCustomerAsync(string customerId)
            => (await _bookingRepo.GetByCustomerIdAsync(customerId)).Select(MapToDto);

        public async Task<BookingDetailDto?> GetDetailAsync(string id)
        {
            var b = await _bookingRepo.GetWithDetailsAsync(id);
            return b is null ? null : MapToDetailDto(b);
        }

        public async Task<BookingDto> CreateAsync(CreateBookingDto dto)
        {
            var hasOverlap = await _bookingRepo.HasOverlappingBookingAsync(
                dto.RoomId, dto.StartDate, dto.EndDate);
            if (hasOverlap)
                throw new InvalidOperationException("Phòng đã được đặt trong khoảng thời gian này.");

            var room = await _roomRepo.GetByIdAsync(dto.RoomId)
                ?? throw new KeyNotFoundException("Không tìm thấy phòng.");

            var duration = dto.EndDate.DayNumber - dto.StartDate.DayNumber;
            var total = (room.PricePerNight) * duration;

            var entity = new Booking
            {
                Id = dto.Id,
                CustomerId = dto.CustomerId,
                RoomId = dto.RoomId,
                ReservationNumber = Guid.NewGuid().ToString("N")[..10].ToUpper(),
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                DurationInDays = duration,
                TotalPrice = total,

                GuestCount = dto.GuestCount,
                SpecialRequest = dto.SpecialRequest,
                CreatedAt = DateTime.UtcNow
            };

            return MapToDto(await _bookingRepo.CreateAsync(entity));
        }



        private static BookingDto MapToDto(Booking b) => new(
            b.Id, b.CustomerId, b.RoomId, b.ReservationNumber,
            b.StartDate, b.EndDate, b.DurationInDays,
            b.TotalPrice, b.GuestCount, b.SpecialRequest, b.CreatedAt);

        private static BookingDetailDto MapToDetailDto(Booking b) => new(
            b.Id,
            b.RoomNav is null ? null : new RoomDto(
                b.RoomNav.Id, b.RoomNav.HotelId, b.RoomNav.RoomNumber, b.RoomNav.RoomType,
                b.RoomNav.Capacity, b.RoomNav.PricePerNight, b.RoomNav.Status,
                b.RoomNav.Description, b.RoomNav.IsSmokingAllowed, Enumerable.Empty<RoomImageDto>()),
            b.ReservationNumber, b.StartDate, b.EndDate, b.DurationInDays,
            b.TotalPrice, b.GuestCount, b.SpecialRequest, b.CreatedAt,
            b.Payments.Select(p => new PaymentDto(
                p.Id, p.BookingId, p.Amount, p.Method,
                p.Status, p.TransactionId, p.PaidAt, p.RefundedAt)));
    }
}