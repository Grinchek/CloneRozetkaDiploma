using CloneRozetka.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;


namespace CloneRozetka.Infrastructure.Persistence.Seed.Products
{
    public static class ProductSeeder
    {
        public static async Task SeedAsync(
       AppDbContext db,
       string jsonPath)
        {

            var json = await File.ReadAllTextAsync(jsonPath);
            var items = JsonSerializer.Deserialize<List<ProductSeedModel>>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];


            // Існуючі за slug
            var existing = await db.Products.AsNoTracking()
                .ToDictionaryAsync(c => c.Slug);

            var toAdd = new List<ProductEntity>();

            foreach (var m in items)
            {
                if (existing.ContainsKey(m.Slug))
                    continue;


                toAdd.Add(new ProductEntity
                {
                    Name = m.Name,
                    Slug = m.Slug,
                    Price = m.Price,
                    Description = m.Description,
                    CategoryId = m.CategoryId,
                    IsDeleted = false
                });

            }

            if (toAdd.Count > 0)
            {
                await db.Products.AddRangeAsync(toAdd);
                await db.SaveChangesAsync();

                // оновлюємо кеш
                existing = await db.Products.AsNoTracking()
                    .ToDictionaryAsync(c => c.Slug);
            }

            await db.SaveChangesAsync();

        }
    }
}
