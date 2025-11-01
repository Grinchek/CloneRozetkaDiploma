using CloneRozetka.Application.Abstractions;
using CloneRozetka.Infrastructure.Identity;
using CloneRozetka.Infrastructure.Persistence;
using CloneRozetka.Infrastructure.Repositories;
using CloneRozetka.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.DataProtection;

namespace CloneRozetka.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        Action<DbContextOptionsBuilder> dbOptions)
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


        services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
        services.AddScoped<IImageService, ImageService>();
        services.AddScoped<IDbSeederService, DbSeederService>(); // ⬅️ додали сюди

        return services;
    }
}
