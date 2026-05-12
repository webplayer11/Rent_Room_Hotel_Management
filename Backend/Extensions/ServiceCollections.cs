using RoomManagement.Repositories.Implementations;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Implementations;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Extensions
{
    /// <summary>
    /// Extension method – đăng ký toàn bộ Repository và Service vào DI container.
    /// Gọi builder.Services.AddApplicationServices() trong Program.cs.
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(
            this IServiceCollection services)
        {
            // ── Repositories ──────────────────────────────────────────────────
            services.AddScoped<IAuthRepository, AuthRepository>();
            services.AddScoped<IAccountRepository, AccountRepository>();
            services.AddScoped<ICustomerRepository, CustomerRepository>();
            services.AddScoped<IHotelOwnerRepository, HotelOwnerRepository>();
            services.AddScoped<IHotelRepository, HotelRepository>();
            services.AddScoped<IRoomRepository, RoomRepository>();
            services.AddScoped<IBookingRepository, BookingRepository>();
            services.AddScoped<IPaymentRepository, PaymentRepository>();
            services.AddScoped<IReviewRepository, ReviewRepository>();
            services.AddScoped<IHotelAmenityRepository, HotelAmenityRepository>();
            services.AddScoped<IWishlistRepository, WishlistRepository>();
            services.AddScoped<IVoucherRepository, VoucherRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<IInvoiceRepository, InvoiceRepository>();
            services.AddScoped<IRevenueReportRepository, RevenueReportRepository>();
            services.AddScoped<IHotelDeleteRequestRepository, HotelDeleteRequestRepository>();

            // ── Services ──────────────────────────────────────────────────────
            services.AddScoped<ICustomerService, CustomerService>();
            services.AddScoped<IHotelService, HotelService>();
            services.AddScoped<IRoomService, RoomService>();
            services.AddScoped<IBookingService, BookingService>();
            services.AddScoped<IPaymentService, PaymentService>();
            services.AddScoped<IReviewService, ReviewService>();
            services.AddScoped<IWishlistService, WishlistService>();
            services.AddScoped<IVoucherService, VoucherService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IInvoiceService, InvoiceService>();
            services.AddScoped<IHotelDeleteRequestService, HotelDeleteRequestService>();

            return services;
        }
    }
}