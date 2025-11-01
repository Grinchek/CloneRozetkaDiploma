using CloneRozetka.Application.Abstractions;
using CloneRozetka.Infrastructure.Persistence;
using CloneRozetka.Infrastructure.Persistence.Seed;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace CloneRozetka.Infrastructure.Services;

public class DbSeederService(IServiceProvider serviceProvider) : IDbSeederService
{
    public async Task SeedData()
    {
        using var scope = serviceProvider.CreateScope();

        var db = serviceProvider.GetRequiredService<AppDbContext>();
        var imageService = scope.ServiceProvider.GetRequiredService<IImageService>();

        await db.Database.MigrateAsync();

        string path = Path.Combine(Directory.GetCurrentDirectory(), "Files", "SeederFiles", "categories.json");

        await CategorySeeder.SeedAsync(db, imageService, path);    }
}
