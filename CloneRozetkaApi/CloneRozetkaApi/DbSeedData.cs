using Core.Models.Seeder;
using Domain;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CloneRozetkaApi;

public static class DbSeedData
{
    public static async Task SeedData(this WebApplication webApplication)
    {
        var scoped = webApplication.Services.CreateScope();
        var context = scoped.ServiceProvider.GetRequiredService<AppDbContext>();

        await context.Database.MigrateAsync();

        if (!context.Categories.Any())
        {
            var jsonFile = Path.Combine(Directory.GetCurrentDirectory(), "Helpers", "JsonData", "Categories.json");
            if (File.Exists(jsonFile))
            {
                var jsonData = await File.ReadAllTextAsync(jsonFile);
                try
                {
                    var categories = JsonSerializer.Deserialize<List<SeederCategoryModel>>(jsonData);
                    var entities = categories.Select(x =>
                        new CategoryEntity
                        {
                            Image = x.Image,
                            Name = x.Name,
                        });

                    await context.AddRangeAsync(entities);
                    await context.SaveChangesAsync();

                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error Json Parse Data {0}", ex.Message);
                }
            }
            else
            {
                Console.WriteLine("Not Found File Categories.json");
            }
        }
    }
}