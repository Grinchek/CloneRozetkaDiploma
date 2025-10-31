using CloneRozetka.Application.Abstractions;
using CloneRozetka.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Quartz.Logging;
using System.Text.Json;

namespace CloneRozetka.Infrastructure.Persistence.Seed;

public static class CategorySeeder
{
    public static async Task SeedAsync(
        AppDbContext db,
        IImageService images,
        string jsonPath)
    {

        var json = await File.ReadAllTextAsync(jsonPath);
        var items = JsonSerializer.Deserialize<List<CategorySeedModel>>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];


        // Існуючі за slug
        var existing = await db.Categories.AsNoTracking()
            .ToDictionaryAsync(c => c.UrlSlug);

        var toAdd = new List<Category>();

        // 1) Додаємо відсутні: зберігаємо картинку з URL -> Image = ім’я збереженого файлу
        foreach (var m in items)
        {
            if (existing.ContainsKey(m.UrlSlug))
                continue;

            string? savedImage = null;

            if (!string.IsNullOrWhiteSpace(m.Image))
            {
                savedImage = await images.SaveImageFromUrlAsync(m.Image);
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
            await db.Categories.AddRangeAsync(toAdd);
            await db.SaveChangesAsync();

            // оновлюємо кеш
            existing = await db.Categories.AsNoTracking()
                .ToDictionaryAsync(c => c.UrlSlug);
        }

        // 2) Прив’язуємо ParentId і, за потреби, дозберігаємо Image для вже існуючих
        foreach (var m in items)
        {
            if (!existing.TryGetValue(m.UrlSlug, out var snapshot))
                continue;

            var tracked = await db.Categories.FirstAsync(c => c.Id == snapshot.Id);

            // ParentId
            if (!string.IsNullOrWhiteSpace(m.ParentSlug) &&
                existing.TryGetValue(m.ParentSlug, out var parent))
            {
                if (tracked.ParentId != parent.Id)
                    tracked.ParentId = parent.Id;
            }
        }

        await db.SaveChangesAsync();

    }
}
