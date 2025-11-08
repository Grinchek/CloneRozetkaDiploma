using CloneRozetka.Application.Abstractions;
using Microsoft.AspNetCore.Identity;
using System.Text.Json;


namespace CloneRozetka.Infrastructure.Persistence.Seed.Users;
public static class UserSeeder
{
    public static async Task SeedAsync<TUser, TRole, TKey>(
        UserManager<TUser> userManager,
        RoleManager<TRole> roleManager,
        IImageService imageService,       
        string jsonPath)
        where TUser : IdentityUser<TKey>, new()
        where TRole : IdentityRole<TKey>, new()
        where TKey : IEquatable<TKey>
    {
        if (!File.Exists(jsonPath))
            return;

        var json = await File.ReadAllTextAsync(jsonPath);
        var items = JsonSerializer.Deserialize<List<UserSeederModel>>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];

        var distinctRoles = items
            .SelectMany(u => u.Roles ?? Enumerable.Empty<string>())
            .Select(r => r.Trim())
            .Where(r => !string.IsNullOrWhiteSpace(r))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        foreach (var roleName in distinctRoles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                var createRole = await roleManager.CreateAsync(new TRole { Name = roleName });
                if (!createRole.Succeeded)
                    throw new InvalidOperationException("Не вдалося створити роль: " + roleName + " | " +
                        string.Join("; ", createRole.Errors.Select(e => e.Description)));
            }
        }

        foreach (var m in items)
        {
            var existing = await userManager.FindByEmailAsync(m.Email);
            if (existing is not null)
            {
                // синхронізуємо ролі, якщо треба
                var currentRoles = await userManager.GetRolesAsync(existing);
                var missingRoles = (m.Roles ?? []).Except(currentRoles, StringComparer.OrdinalIgnoreCase).ToList();

                if (missingRoles.Count > 0)
                {
                    var res = await userManager.AddToRolesAsync(existing, missingRoles);
                    if (!res.Succeeded)
                        throw new InvalidOperationException("Не вдалося додати ролі користувачу " + m.Email + " | " +
                            string.Join("; ", res.Errors.Select(e => e.Description)));
                }

                continue;
            }

            string? savedAvatar = null;
            if (!string.IsNullOrWhiteSpace(m.AvatarUrl))
            {
                try
                {

                    savedAvatar = await imageService.SaveImageFromUrlAsync(m.AvatarUrl!);
                }
                catch
                {

                }
            }
            var user = new TUser
            {
                UserName = m.Email,
                Email = m.Email,
            };

            var fullNameProp = typeof(TUser).GetProperty("FullName");
            fullNameProp?.SetValue(user, m.FullName);

            var avatarProp = typeof(TUser).GetProperty("AvatarUrl");
            
            //Console.WriteLine($"Beforoe saving{savedAvatar}");
            avatarProp?.SetValue(user, savedAvatar);
            //Console.WriteLine($"After saving{avatarProp}" );

            var createRes = await userManager.CreateAsync(user, m.Password);
            if (!createRes.Succeeded)
                throw new InvalidOperationException("Не вдалося створити користувача " + m.Email + " | " +
                    string.Join("; ", createRes.Errors.Select(e => e.Description)));


            if (m.Roles is { Count: > 0 })
            {
                var roleRes = await userManager.AddToRolesAsync(user, m.Roles);
                if (!roleRes.Succeeded)
                    throw new InvalidOperationException("Не вдалося додати ролі користувачу " + m.Email + " | " +
                        string.Join("; ", roleRes.Errors.Select(e => e.Description)));
            }
        }

    }
}


