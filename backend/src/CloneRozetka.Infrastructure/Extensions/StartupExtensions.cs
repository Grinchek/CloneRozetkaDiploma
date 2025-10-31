// !!! ВАЖЛИВО: змініть цей using під реальний неймспейс вашого AppDbContext
// Наприклад, якщо у вас namespace CloneRozetka.Infrastructure; то так і напишіть:
using CloneRozetka.Infrastructure; // <-- замініть на правильний
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloneRozetka.Infrastructure.Persistence;

namespace CloneRozetka.Infrastructure.Extensions
{
    public static class StartupExtensions
    {
        public static async Task ApplyMigrationsAsync(this IServiceScope scope, CancellationToken ct = default)
        {
            var services = scope.ServiceProvider;

            var logger = services
                .GetRequiredService<ILoggerFactory>()
                .CreateLogger("DatabaseMigration");

            try
            {
                var db = services.GetRequiredService<AppDbContext>();

                var pending = await db.Database.GetPendingMigrationsAsync(ct);
                if (!pending.Any())
                {
                    logger.LogInformation("✅ База даних актуальна — немає відкладених міграцій.");
                    return;
                }

                await db.Database.MigrateAsync(ct);
                logger.LogInformation("✅ Міграції застосовано: {Count}", pending.Count());
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "❌ Помилка під час застосування міграцій.");
                throw;
            }
        }
    }
}
