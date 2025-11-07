namespace CloneRozetka.Infrastructure.Persistence.Seed;

public sealed class UserSeederModel
{
    public string? FullName { get; set; } = default!;
    public string? AvatarUrl { get; set; }
    public string Password { get; set; } = default!;
    public List<string>? Roles { get; set; }
}
