using CloneRozetka.Application.Abstractions;
using CloneRozetka.Infrastructure.Extensions;
using CloneRozetka.Infrastructure.Persistence.Seed;
using Microsoft.Extensions.DependencyInjection;

namespace CloneRozetka.Infrastructure.Services;

public class DbSeederService(IServiceProvider serviceProvider) : IDbSeederService
{
    public async Task SeedData()
    {
        using var scope = serviceProvider.CreateScope();

        await scope.ApplyMigrationsAsync();

        await scope.SeedCategoriesAsync(Path.Combine("Files", "SeederFiles", "categories.json"));
    }
}
