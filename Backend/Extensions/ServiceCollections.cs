using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Repositories.Implementations;
using RoomManagement.Services.Interfaces;
using RoomManagement.Services.Implementations;

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
            services.AddScoped<IHostProfileRepository, HostProfileRepository>();
            services.AddScoped<IHotelRepository, HotelRepository>();
            services.AddScoped<IRoomRepository, RoomRepository>();
            services.AddScoped<IBookingRepository, BookingRepository>();
            services.AddScoped<IPaymentRepository, PaymentRepository>();
            services.AddScoped<IVoucherRepository, VoucherRepository>();

            // ── Services ──────────────────────────────────────────────────────
            services.AddScoped<IHostProfileService, HostProfileService>();
            services.AddScoped<IHotelService, HotelService>();
            services.AddScoped<IRoomService, RoomService>();
            services.AddScoped<IBookingService, BookingService>();
            services.AddScoped<IPaymentService, PaymentService>();
            services.AddScoped<IAdminService, AdminService>();
            services.AddScoped<IVoucherService, VoucherService>();
            services.AddScoped<IHostRevenueService, HostRevenueService>();
            services.AddScoped<IStorageService, MinIOStorageService>();

            return services;
        }
    }
}
