using CloneRozetka.Application.Abstractions;
using CloneRozetka.Infrastructure.Identity;
using CloneRozetka.Infrastructure.Persistence;
using CloneRozetka.Infrastructure.Repositories;
using CloneRozetka.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.DataProtection;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;

namespace CloneRozetka.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        Action<DbContextOptionsBuilder> dbOptions,
        IConfiguration? configuration = null)
    {
        services.AddDbContext<AppDbContext>(dbOptions);

        // Data Protection 
        services.AddDataProtection()
            .PersistKeysToFileSystem(new DirectoryInfo(
                Path.Combine(AppContext.BaseDirectory, "dpkeys")))
            .SetApplicationName("CloneRozetka");


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

        if (configuration is not null)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));

            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = false; // локально зручно; на проді → true
                    options.SaveToken = true;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = configuration["Jwt:Issuer"],
                        ValidateAudience = true,
                        ValidAudience = configuration["Jwt:Audience"],
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = key,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.FromSeconds(30)
                    };
                });
        }
        services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
        services.AddScoped<IImageService, ImageService>();
        services.AddScoped<IDbSeederService, DbSeederService>(); // ⬅️ додали сюди

        return services;
    }
}
