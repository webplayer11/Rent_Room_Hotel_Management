using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RoomManagement.Models;
using System.Text.Json;

namespace RoomManagement.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<HostProfile> HostProfiles { get; set; }
    public DbSet<Hotel> Hotels { get; set; }
    public DbSet<HotelImage> HotelImages { get; set; }
    public DbSet<Room> Rooms { get; set; }
    public DbSet<RoomImage> RoomImages { get; set; }
    public DbSet<Amenity> Amenities { get; set; }
    public DbSet<RoomAmenity> RoomAmenities { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Wishlist> Wishlists { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Voucher> Vouchers { get; set; }
    public DbSet<Promotion> Promotions { get; set; }
    public DbSet<RevenueReport> RevenueReports { get; set; }
    public DbSet<HotelRequest> HotelRequests { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Rename Identity Tables
        modelBuilder.Entity<ApplicationUser>().ToTable("Users");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityRole>().ToTable("Roles");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<string>>().ToTable("UserRoles");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<string>>().ToTable("UserClaims");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<string>>().ToTable("UserLogins");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>>().ToTable("RoleClaims");
        modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<string>>().ToTable("UserTokens");

        // 1-1 ApplicationUser - HostProfile
        modelBuilder.Entity<ApplicationUser>()
            .HasOne(a => a.HostProfile)
            .WithOne(h => h.User)
            .HasForeignKey<HostProfile>(h => h.Id)
            .OnDelete(DeleteBehavior.Cascade);

        // Hotel - HostProfile
        modelBuilder.Entity<Hotel>()
            .HasOne(h => h.Host)
            .WithMany(hp => hp.Hotels)
            .HasForeignKey(h => h.HostId)
            .OnDelete(DeleteBehavior.Restrict);

        // Hotel - Amenity (M-N)
        modelBuilder.Entity<Hotel>()
            .HasMany(h => h.Amenities)
            .WithMany(a => a.Hotels)
            .UsingEntity(j => j.ToTable("HotelAmenities"));

        // Room - RoomAmenity (M-N)
        modelBuilder.Entity<Room>()
            .HasMany(r => r.RoomAmenities)
            .WithMany(ra => ra.Rooms)
            .UsingEntity(j => j.ToTable("Room_RoomAmenities"));

        // Room - Hotel
        modelBuilder.Entity<Room>()
            .HasOne(r => r.Hotel)
            .WithMany(h => h.Rooms)
            .HasForeignKey(r => r.HotelId)
            .OnDelete(DeleteBehavior.Cascade);

        // Booking
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.User)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Room)
            .WithMany(r => r.Bookings)
            .HasForeignKey(b => b.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        // Payment
        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Booking)
            .WithMany(b => b.Payments)
            .HasForeignKey(p => p.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        // Invoice (1-1 Booking)
        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.Booking)
            .WithOne(b => b.Invoice)
            .HasForeignKey<Invoice>(i => i.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        // Review
        modelBuilder.Entity<Review>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Hotel)
            .WithMany(h => h.Reviews)
            .HasForeignKey(r => r.HotelId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Booking)
            .WithOne(b => b.Review)
            .HasForeignKey<Review>(r => r.BookingId)
            .OnDelete(DeleteBehavior.SetNull);

        // Wishlist
        modelBuilder.Entity<Wishlist>()
            .HasOne(w => w.User)
            .WithMany(u => u.Wishlists)
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Wishlist>()
            .HasOne(w => w.Hotel)
            .WithMany()
            .HasForeignKey(w => w.HotelId)
            .OnDelete(DeleteBehavior.Cascade);

        // Notification
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // HotelRequest
        modelBuilder.Entity<HotelRequest>()
            .HasOne(hr => hr.Hotel)
            .WithMany()
            .HasForeignKey(hr => hr.HotelId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<HotelRequest>()
            .HasOne(hr => hr.Host)
            .WithMany()
            .HasForeignKey(hr => hr.HostId)
            .OnDelete(DeleteBehavior.Restrict);

        // RevenueReport
        modelBuilder.Entity<RevenueReport>()
            .HasOne(rr => rr.Hotel)
            .WithMany(h => h.RevenueReports)
            .HasForeignKey(rr => rr.HotelId)
            .OnDelete(DeleteBehavior.Cascade);

        // Voucher → Hotel (nullable: null = voucher toàn sàn)
        modelBuilder.Entity<Voucher>()
            .HasOne(v => v.Hotel)
            .WithMany()
            .HasForeignKey(v => v.HotelId)
            .OnDelete(DeleteBehavior.Cascade);

        // Voucher → ApplicationUser (người tạo)
        modelBuilder.Entity<Voucher>()
            .HasOne(v => v.CreatedByUser)
            .WithMany()
            .HasForeignKey(v => v.CreatedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        // Booking → Voucher
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Voucher)
            .WithMany(v => v.Bookings)
            .HasForeignKey(b => b.VoucherId)
            .OnDelete(DeleteBehavior.SetNull);

        // HostProfile - BusinessLicenseUrls
        modelBuilder.Entity<HostProfile>()
        .Property(x => x.BusinessLicenseUrls)
        .HasConversion(
        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
    );
    }
}
