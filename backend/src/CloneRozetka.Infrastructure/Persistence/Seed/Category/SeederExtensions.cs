using CloneRozetka.Application.Abstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CloneRozetka.Infrastructure.Persistence.Seed;

public static class SeederExtensions
{
    public static async Task SeedCategoriesAsync(
        this IServiceScope scope,
        string jsonRelativePath,
        CancellationToken ct = default)
    {

        var env = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
                                          .CreateLogger("CategorySeeder");
        var images = scope.ServiceProvider.GetRequiredService<IImageService>();

        

        // 1) Першою спробою — від кореня проєкту Api (ContentRootPath)
        string path = Path.IsPathRooted(jsonRelativePath)
            ? jsonRelativePath
            : Path.Combine(env.ContentRootPath, jsonRelativePath);

        // 2) Якщо не знайшли — пробуємо у вихідній папці (bin)
        if (!File.Exists(path))
        {
            var alt = Path.Combine(AppContext.BaseDirectory, jsonRelativePath);
            if (File.Exists(alt)) path = alt;
        }

        logger.LogInformation("Category seed file resolved to: {Path} (exists={Exists})",
            path, File.Exists(path));

        if (!File.Exists(path))
        {
            logger.LogWarning("Seed file not found: {Path}", path);
            return;
        }

        await CategorySeeder.SeedAsync(db, images, logger, path, ct);
    }
}
