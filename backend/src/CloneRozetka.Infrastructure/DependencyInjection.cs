using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Cart;
using CloneRozetka.Application.Compare;
using CloneRozetka.Application.Favorites;
using CloneRozetka.Application.Orders;
using CloneRozetka.Application.ProductAttributes;
using CloneRozetka.Application.Users.Interfaces;
using CloneRozetka.Infrastructure.Persistence;
using CloneRozetka.Infrastructure.Services.ProductAttributes;
using CloneRozetka.Infrastructure.Services.Cart;
using CloneRozetka.Infrastructure.Services.Compare;
using CloneRozetka.Infrastructure.Services.Favorites;
using CloneRozetka.Infrastructure.Services.Orders;
using CloneRozetka.Infrastructure.Repositories;
using CloneRozetka.Infrastructure.Services;
using CloneRozetka.Infrastructure.Services.Users;
using CloneRozetka.Infrastructure.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CloneRozetka.Application;

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
        if (configuration is not null)
        {
            var jwtKey = configuration["Jwt:Key"]
                         ?? throw new InvalidOperationException("Jwt:Key is missing in configuration.");
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

            services
                .AddAuthentication(options =>
                {
 
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
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
        services.AddScoped<ISmtpService, SmtpService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IFavoritesService, FavoritesService>();
        services.AddScoped<ICompareService, CompareService>();
        services.AddScoped<ICategoryAttributesService, CategoryAttributesService>();
        services.AddScoped<IProductAttributesService, ProductAttributesService>();
        services.AddScoped<IAdminAttributesService, AdminAttributesService>();

        return services;
    }
}
