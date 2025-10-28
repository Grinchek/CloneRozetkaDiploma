using CloneRozetka.Application.Abstractions;
using CloneRozetka.Infrastructure.Persistence;
using CloneRozetka.Infrastructure.Repositories;
using CloneRozetka.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace CloneRozetka.Infrastructure;

public static class DependencyInjection
{
    // Варіант А: передаємо конфігуратор провайдера напряму (гнучко)
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        Action<DbContextOptionsBuilder> dbOptions)
    {
        services.AddDbContext<AppDbContext>(dbOptions);

        services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
        services.AddScoped<IImageService, ImageService>();

        return services;
    }

    // Варіант B: connectionString + обраний провайдер (SqlServer/Npgsql)
    //public static IServiceCollection AddInfrastructureSqlServer(
    //    this IServiceCollection services, string connectionString)
    //    => services.AddInfrastructure(opt => opt.UseSqlServer(connectionString));

    public static IServiceCollection AddInfrastructureNpgsql(
        this IServiceCollection services, string connectionString)
        => services.AddInfrastructure(opt => opt.UseNpgsql(connectionString));
}
