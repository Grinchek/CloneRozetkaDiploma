using CloneRozetka.Application.Abstractions;
using CloneRozetka.Domain.Entities.Identity;
using System.Text.Json;

namespace CloneRozetka.Infrastructure.Persistence.Seed.Users;
public static class UserSeeder
{
    public static async Task SeedAsync(
  AppDbContext db,
  IImageService images,
  string jsonPath)
    {
        var json = await File.ReadAllTextAsync(jsonPath);
        var items = JsonSerializer.Deserialize<List<UserSeederModel>>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];

        var toAdd = new List<AppUser>();

        foreach (var m in items)
        {
            toAdd.Add(new AppUser
            {
                FullName = m.FullName,
                AvatarUrl = m.AvatarUrl,

            });
        }



        await db.Users.AddRangeAsync(toAdd);
        await db.SaveChangesAsync();
    }
}


