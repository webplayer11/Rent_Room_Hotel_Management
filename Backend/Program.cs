using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RoomManagement.Extensions;
using RoomManagement.Data;
using RoomManagement.Models;

var builder = WebApplication.CreateBuilder(args);

// ═══════════════════════════════════════════════════════════════
//  1. DATABASE
// ═══════════════════════════════════════════════════════════════
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("Default"),
        sql => sql.EnableRetryOnFailure(maxRetryCount: 5,
                                        maxRetryDelay: TimeSpan.FromSeconds(10),
                                        errorNumbersToAdd: null)
    )
);

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>().AddDefaultTokenProviders();

// ═══════════════════════════════════════════════════════════════
//  2. REPOSITORIES + SERVICES  (một dòng duy nhất)
// ═══════════════════════════════════════════════════════════════
builder.Services.AddApplicationServices();

// ═══════════════════════════════════════════════════════════════
//  3. CONTROLLERS + JSON
// ═══════════════════════════════════════════════════════════════
builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
        opt.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// ═══════════════════════════════════════════════════════════════
//  4. SWAGGER
// ═══════════════════════════════════════════════════════════════
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opt =>
{
    opt.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Rent API",
        Version = "v1",
        Description = "API quản lý đặt phòng khách sạn"
    });
});

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            IssuerSigningKey =  new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
        };
    });

// ═══════════════════════════════════════════════════════════════
//  5. CORS
// ═══════════════════════════════════════════════════════════════
builder.Services.AddCors(opt =>
    opt.AddPolicy("AllowAll", p =>
        p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

// ═══════════════════════════════════════════════════════════════
//  6. BUILD + MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    app.UseSwagger();
    app.UseSwaggerUI(opt =>
    {
        opt.SwaggerEndpoint("/swagger/v1/swagger.json", "Rent API v1");
        opt.RoutePrefix = string.Empty;
    });
}

//app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.MapControllers();   
app.Run();