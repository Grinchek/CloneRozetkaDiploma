using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CloneRozetka.Infrastructure.Persistence.Seed;

public static class SeederExtensions
{
    public static async Task SeedCategoriesAsync(this IServiceProvider services, string? jsonRelativePath = null, CancellationToken ct = default)
    {
        using var scope = services.CreateScope();
        var env = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("CategorySeeder");

        db.Database.Migrate();
        var defaultPath = Path.Combine(AppContext.BaseDirectory, "categories.json");

        var path = jsonRelativePath is null ? defaultPath : Path.Combine(AppContext.BaseDirectory, jsonRelativePath);
        await CategorySeeder.SeedAsync(db, logger, path, ct);
    }
}
