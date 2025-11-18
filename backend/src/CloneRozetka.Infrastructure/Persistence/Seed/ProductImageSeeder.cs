using CloneRozetka.Domain.Entities;
using CloneRozetka.Infrastructure.Persistence;
using CloneRozetka.Application.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace CloneRozetka.Infrastructure.Persistence.Seed.Products
{
    public static class ProductImageSeeder
    {
        public static async Task SeedAsync(
            AppDbContext db,
            IImageService imageService)
        {

            var products = await db.Products
                .AsNoTracking()
                .OrderBy(p => p.Id)
                .ToListAsync();

            if (products.Count == 0)
                return;


            var productsWithImages = await db.ProductImages
                .AsNoTracking()
                .Select(pi => pi.ProductId)
                .Distinct()
                .ToListAsync();

            var toAdd = new List<ProductImageEntity>();

            int seedCounter = 1;

            foreach (var product in products)
            {
                if (productsWithImages.Contains(product.Id))
                    continue;


                // https://picsum.photos/seed/1/800/600
                var seed = seedCounter++; 
                var url = $"https://picsum.photos/seed/{seed}/800/600";

                string imageName;
                try
                {
                    imageName = await imageService.SaveImageFromUrlAsync(url);
                }
                catch
                {

                    continue;
                }

                toAdd.Add(new ProductImageEntity
                {
                    Name = imageName,
                    Priority = 1,
                    ProductId = product.Id
                });
            }

            if (toAdd.Count > 0)
            {
                await db.ProductImages.AddRangeAsync(toAdd);
                await db.SaveChangesAsync();
            }
        }
    }
}
