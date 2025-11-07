using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Users.Interfaces;
using CloneRozetka.Domain.Entities.Identity;
using CloneRozetka.Infrastructure.Persistence;
using CloneRozetka.Infrastructure.Repositories;
using CloneRozetka.Infrastructure.Services;
using CloneRozetka.Infrastructure.Services.Users;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace CloneRozetka.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        Action<DbContextOptionsBuilder> dbOptions,
        IConfiguration? configuration = null)
    {
        // -----------------------------
        // 1. Database context
        // -----------------------------
        services.AddDbContext<AppDbContext>(dbOptions);

        // -----------------------------
        // 2. Data Protection
        // -----------------------------
        services.AddDataProtection()
            .PersistKeysToFileSystem(new DirectoryInfo(
                Path.Combine(AppContext.BaseDirectory, "dpkeys")))
            .SetApplicationName("CloneRozetka");

        // -----------------------------
        // 3. Identity Core
        // -----------------------------
        services
            .AddIdentityCore<AppUser>(opt =>
            {
                opt.Password.RequiredLength = 6;
                opt.Password.RequireDigit = false;
                opt.Password.RequireUppercase = false;
                opt.Password.RequireNonAlphanumeric = false;
                opt.User.RequireUniqueEmail = true;
                opt.SignIn.RequireConfirmedEmail = false;
            })
            .AddRoles<AppRole>()
            .AddEntityFrameworkStores<AppDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();

        // -----------------------------
        // 4. Authentication Schemes
        // -----------------------------
        if (configuration is not null)
        {
            var jwtKey = configuration["Jwt:Key"]
                         ?? throw new InvalidOperationException("Jwt:Key is missing in configuration.");
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

            services
                .AddAuthentication(options =>
                {
                    // Основна схема для API — JWT
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;

                    // Схема для входу через зовнішніх провайдерів (Google)
                    options.DefaultSignInScheme = IdentityConstants.ExternalScheme;

                    // Основна схема для Cookie (Identity)
                    options.DefaultScheme = IdentityConstants.ApplicationScheme;

                    // ВАЖЛИВО: лише Google як DefaultChallengeScheme
                    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
                })
                .AddCookie(IdentityConstants.ExternalScheme, o =>
                {
                    o.Cookie.SameSite = SameSiteMode.None;
                    o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                })
                .AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = false;
                    options.SaveToken = true;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = configuration["Jwt:Issuer"],
                        ValidateAudience = true,
                        ValidAudience = configuration["Jwt:Audience"],
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = signingKey,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.FromSeconds(30)
                    };
                })
                .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
                {
                    options.ClientId = configuration["GoogleAuth:ClientId"]!;
                    options.ClientSecret = configuration["GoogleAuth:ClientSecret"]!;
                    options.CallbackPath = configuration["GoogleAuth:CallbackPath"]
                                           ?? "/api/auth/google/callback";
                    options.SaveTokens = true;

                    options.CorrelationCookie.SameSite = SameSiteMode.None;
                    options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.Always;
                });
        }

        // -----------------------------
        // 5. Infrastructure Services
        // -----------------------------
        services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
        services.AddScoped<IImageService, ImageService>();
        services.AddScoped<IDbSeederService, DbSeederService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAccountService, AccountService>();

        return services;
    }
}
