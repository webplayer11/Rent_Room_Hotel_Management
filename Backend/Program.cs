using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using RoomManagement.Extensions;
using System.Text.Json;
using System.Text.Json.Serialization;
using RoomManagement.Data;       
using RoomManagement.Filters;     
using RoomManagement.Middlewares; 

var builder = WebApplication.CreateBuilder(args);

// ═══════════════════════════════════════════════════════════════════
//  1. DATABASE – EF Core + SQL Server
// ═══════════════════════════════════════════════════════════════════
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' chưa được cấu hình."),
        sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(10),
                errorNumbersToAdd: null);
            sqlOptions.CommandTimeout(30);
        });

    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

// ═══════════════════════════════════════════════════════════════════
//  2. REPOSITORIES + SERVICES
// ═══════════════════════════════════════════════════════════════════
builder.Services.AddApplicationServices();

// ═══════════════════════════════════════════════════════════════════
//  3. CONTROLLERS + JSON + VALIDATION
// ═══════════════════════════════════════════════════════════════════
builder.Services.AddControllers(options =>
{
    // Tự động trả 400 nếu ModelState không hợp lệ (không cần check trong Controller)
    options.Filters.Add<ValidationFilter>();
})
.AddJsonOptions(options =>
{
    // camelCase JSON response
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;

    // Tránh lỗi vòng lặp circular reference từ navigation properties
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;

    // Bỏ qua property null trong response → response gọn hơn
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;

    // Cho phép đọc số dạng string từ JSON body
    options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString;
})
.ConfigureApiBehaviorOptions(options =>
{
    // Tắt response mặc định 400 của ASP.NET — để ValidationFilter xử lý theo chuẩn ApiResponse
    options.SuppressModelStateInvalidFilter = true;
});

// ═══════════════════════════════════════════════════════════════════
//  4. API VERSIONING
// ═══════════════════════════════════════════════════════════════════
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true; // Trả header "api-supported-versions"
});

// ═══════════════════════════════════════════════════════════════════
//  5. SWAGGER / OPENAPI
// ═══════════════════════════════════════════════════════════════════
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Rent API",
        Version = "v1",
        Description = "API quản lý đặt phòng khách sạn"
    });

    // JWT Bearer support trong Swagger UI
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT token. Ví dụ: Bearer eyJhbGci..."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ═══════════════════════════════════════════════════════════════════
//  6. CORS
// ═══════════════════════════════════════════════════════════════════
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());

    // Production – bỏ comment và cấu hình AllowedOrigins trong appsettings.json
    // options.AddPolicy("AllowFrontend", policy =>
    //     policy.WithOrigins(
    //             builder.Configuration
    //                    .GetSection("AllowedOrigins")
    //                    .Get<string[]>() ?? Array.Empty<string>())
    //           .AllowAnyHeader()
    //           .AllowAnyMethod()
    //           .AllowCredentials());
});

// ═══════════════════════════════════════════════════════════════════
//  7. HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database");

// ═══════════════════════════════════════════════════════════════════
//  8. JWT AUTHENTICATION  — bỏ comment khi cần
// ═══════════════════════════════════════════════════════════════════
// builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//     .AddJwtBearer(options =>
//     {
//         var jwtKey = builder.Configuration["Jwt:Key"]
//             ?? throw new InvalidOperationException("JWT Key chưa được cấu hình.");
//
//         options.TokenValidationParameters = new TokenValidationParameters
//         {
//             ValidateIssuer           = true,
//             ValidateAudience         = true,
//             ValidateLifetime         = true,
//             ValidateIssuerSigningKey = true,
//             ValidIssuer              = builder.Configuration["Jwt:Issuer"],
//             ValidAudience            = builder.Configuration["Jwt:Audience"],
//             IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
//             ClockSkew                = TimeSpan.Zero
//         };
//     });
// builder.Services.AddAuthorization();

// ═══════════════════════════════════════════════════════════════════
//  9. BUILD APP
// ═══════════════════════════════════════════════════════════════════
var app = builder.Build();

// ═══════════════════════════════════════════════════════════════════
//  10. AUTO MIGRATION (chỉ Development)
// ═══════════════════════════════════════════════════════════════════
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
        app.Logger.LogInformation("✅ Database migration hoàn tất.");
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "❌ Lỗi khi chạy database migration.");
        throw;
    }
}

// ═══════════════════════════════════════════════════════════════════
//  11. MIDDLEWARE PIPELINE
//  ⚠️ Thứ tự này có ý nghĩa — không được đổi chỗ tùy tiện
// ═══════════════════════════════════════════════════════════════════

// [1] Global exception handler — phải đứng ĐẦU TIÊN
app.UseGlobalExceptionHandler();

// [2] HTTPS Redirect
app.UseHttpsRedirection();

// [3] Swagger — chỉ Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Rent API v1");
        options.RoutePrefix = string.Empty; // Swagger tại "/"
        options.DisplayRequestDuration();           // Hiển thị thời gian response
    });
}

// [4] CORS — phải đứng TRƯỚC Authentication
var corsPolicy = app.Environment.IsDevelopment() ? "AllowAll" : "AllowAll";
// ↑ Đổi "AllowAll" thứ 2 thành "AllowFrontend" khi deploy production
app.UseCors(corsPolicy);

// [5] Authentication + Authorization (bỏ comment khi thêm JWT)
// app.UseAuthentication();
// app.UseAuthorization();

// [6] Health check — GET /health
app.MapHealthChecks("/health");

// [7] Controllers
app.MapControllers();

app.Logger.LogInformation("Rent API đang chạy.");
app.Run();