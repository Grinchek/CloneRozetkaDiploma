using CloneRozetka.Application.Abstractions;
using CloneRozetka.Infrastructure.Identity;
using CloneRozetka.Infrastructure.Persistence;
using CloneRozetka.Infrastructure.Persistence.Seed;
using CloneRozetka.Infrastructure.Persistence.Seed.Attributes;
using CloneRozetka.Infrastructure.Persistence.Seed.Products;
using CloneRozetka.Infrastructure.Persistence.Seed.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace CloneRozetka.Infrastructure.Services;

public class DbSeederService(IServiceProvider serviceProvider) : IDbSeederService
{
    public async Task SeedData()
    {
        using var scope = serviceProvider.CreateScope();
        var sp = scope.ServiceProvider;

        var db = sp.GetRequiredService<AppDbContext>();
        var imageService = sp.GetRequiredService<IImageService>();


        var userManager = sp.GetRequiredService<UserManager<AppUser>>();
        var roleManager = sp.GetRequiredService<RoleManager<AppRole>>();

        await db.Database.MigrateAsync();

        var catPath = Path.Combine(Directory.GetCurrentDirectory(), "Files", "SeederFiles", "categories.json");
        await CategorySeeder.SeedAsync(db, imageService, catPath); 

        var userPath = Path.Combine(Directory.GetCurrentDirectory(), "Files", "SeederFiles", "users.json");
        await UserSeeder.SeedAsync<AppUser, AppRole, int>(
            userManager, roleManager, imageService, userPath);

        var productPath = Path.Combine(Directory.GetCurrentDirectory(), "Files", "SeederFiles", "products.json");
        await ProductSeeder.SeedAsync(db, productPath);

        await ProductImageSeeder.SeedAsync(db, imageService);

        var attributesPath = Path.Combine(Directory.GetCurrentDirectory(), "Files", "SeederFiles", "attributes.json");
        await AttributeSeeder.SeedAsync(db, attributesPath);
    }
}