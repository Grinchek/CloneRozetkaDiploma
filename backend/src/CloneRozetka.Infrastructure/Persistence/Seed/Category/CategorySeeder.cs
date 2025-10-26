using System.Text.Json;
using CloneRozetka.Domain.Entities;
using CloneRozetka.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CloneRozetka.Infrastructure.Persistence.Seed;

public static class CategorySeeder
{
    public static async Task SeedAsync(AppDbContext db, ILogger logger, string jsonPath, CancellationToken ct = default)
    {
        if (!File.Exists(jsonPath))
        {
            logger.LogWarning("Category seed file not found at {Path}", jsonPath);
            return;
        }

        var json = await File.ReadAllTextAsync(jsonPath, ct);
        var items = JsonSerializer.Deserialize<List<CategorySeedModel>>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();

        if (items.Count == 0)
        {
            logger.LogInformation("Category seed: no items found.");
            return;
        }

        var existingBySlug = await db.Categories
            .AsNoTracking()
            .ToDictionaryAsync(c => c.UrlSlug, c => c, ct);

        var toAdd = new List<Category>();
        foreach (var m in items)
        {
            if (existingBySlug.ContainsKey(m.UrlSlug)) continue;

            toAdd.Add(new Category
            {
                Name = m.Name,
                Priority = m.Priority,
                UrlSlug = m.UrlSlug,
                Image = m.Image,
                IsDeleted = false
            });
        }

        if (toAdd.Count > 0)
        {
            await db.Categories.AddRangeAsync(toAdd, ct);
            await db.SaveChangesAsync(ct);
            existingBySlug = await db.Categories.AsNoTracking()
                .ToDictionaryAsync(c => c.UrlSlug, c => c, ct);
        }

        foreach (var m in items.Where(x => !string.IsNullOrWhiteSpace(x.ParentSlug)))
        {
            if (!existingBySlug.TryGetValue(m.UrlSlug, out var child)) continue;
            if (!existingBySlug.TryGetValue(m.ParentSlug!, out var parent))
            {
                logger.LogWarning("Parent slug '{ParentSlug}' not found for child '{Slug}'", m.ParentSlug, m.UrlSlug);
                continue;
            }

            if (child.ParentId == parent.Id) continue;

            var trackedChild = await db.Categories.FirstAsync(c => c.Id == child.Id, ct);
            trackedChild.ParentId = parent.Id;
        }

        await db.SaveChangesAsync(ct);

        logger.LogInformation("Category seed completed. Total: {Total}, Added: {Added}", items.Count, toAdd.Count);
    }
}
