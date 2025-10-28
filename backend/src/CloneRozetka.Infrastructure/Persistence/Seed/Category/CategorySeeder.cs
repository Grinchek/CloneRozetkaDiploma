using System.Text.Json;
using CloneRozetka.Application.Abstractions;
using CloneRozetka.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CloneRozetka.Infrastructure.Persistence.Seed;

public static class CategorySeeder
{
    public static async Task SeedAsync(
        AppDbContext db,
        IImageService images,
        ILogger logger,
        string jsonPath,
        CancellationToken ct = default)
    {
        if (!File.Exists(jsonPath))
        {
            logger.LogWarning("Seed file not found: {Path}", jsonPath);
            return;
        }

        var json = await File.ReadAllTextAsync(jsonPath, ct);
        var items = JsonSerializer.Deserialize<List<CategorySeedModel>>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];

        if (items.Count == 0)
        {
            logger.LogInformation("No categories to seed.");
            return;
        }

        // Існуючі за slug
        var existing = await db.Categories.AsNoTracking()
            .ToDictionaryAsync(c => c.UrlSlug, c => c, ct);

        var toAdd = new List<Category>();

        // 1) Додаємо відсутні: зберігаємо картинку з URL -> Image = ім’я збереженого файлу
        foreach (var m in items)
        {
            if (existing.ContainsKey(m.UrlSlug))
                continue;

            string? savedImage = null;

            if (!string.IsNullOrWhiteSpace(m.Image))
            {
                if (!Uri.IsWellFormedUriString(m.Image, UriKind.Absolute))
                {
                    logger.LogWarning("Invalid image URL for slug '{Slug}': {Url}", m.UrlSlug, m.Image);
                }
                else
                {
                    try
                    {
                        savedImage = await images.SaveImageFromUrlAsync(m.Image);
                    }
                    catch (Exception ex)
                    {
                        logger.LogWarning(ex, "Failed to save image for slug '{Slug}' from {Url}", m.UrlSlug, m.Image);
                    }
                }
            }

            toAdd.Add(new Category
            {
                Name = m.Name,
                Priority = m.Priority,
                UrlSlug = m.UrlSlug,
                ParentId = null,        // прив’яжемо нижче
                Image = savedImage,  // ім’я файлу (напр. 9a2b... .webp)
                IsDeleted = false
            });
        }

        if (toAdd.Count > 0)
        {
            await db.Categories.AddRangeAsync(toAdd, ct);
            await db.SaveChangesAsync(ct);

            // оновлюємо кеш
            existing = await db.Categories.AsNoTracking()
                .ToDictionaryAsync(c => c.UrlSlug, c => c, ct);
        }

        // 2) Прив’язуємо ParentId і, за потреби, дозберігаємо Image для вже існуючих
        foreach (var m in items)
        {
            if (!existing.TryGetValue(m.UrlSlug, out var snapshot))
                continue;

            var tracked = await db.Categories.FirstAsync(c => c.Id == snapshot.Id, ct);

            // ParentId
            if (!string.IsNullOrWhiteSpace(m.ParentSlug) &&
                existing.TryGetValue(m.ParentSlug, out var parent))
            {
                if (tracked.ParentId != parent.Id)
                    tracked.ParentId = parent.Id;
            }

            // Якщо в БД немає картинки, але в JSON є URL — докачуємо й зберігаємо
            if (string.IsNullOrWhiteSpace(tracked.Image) && !string.IsNullOrWhiteSpace(m.Image))
            {
                if (Uri.IsWellFormedUriString(m.Image, UriKind.Absolute))
                {
                    try
                    {
                        tracked.Image = await images.SaveImageFromUrlAsync(m.Image);
                    }
                    catch (Exception ex)
                    {
                        logger.LogWarning(ex, "Failed to save image for existing slug '{Slug}' from {Url}", m.UrlSlug, m.Image);
                    }
                }
                else
                {
                    logger.LogWarning("Invalid image URL for existing slug '{Slug}': {Url}", m.UrlSlug, m.Image);
                }
            }
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Category seed finished. Items: {All}, Added: {Added}", items.Count, toAdd.Count);
    }
}
