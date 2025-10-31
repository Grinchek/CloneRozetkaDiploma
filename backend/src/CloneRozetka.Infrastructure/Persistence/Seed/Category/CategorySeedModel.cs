namespace CloneRozetka.Infrastructure.Persistence.Seed;

public sealed class CategorySeedModel
{
    public string Name { get; set; } = default!;
    public int Priority { get; set; }
    public string UrlSlug { get; set; } = default!;
    public string? ParentSlug { get; set; }
    public string? Image { get; set; }

    public List<CategorySeedModel>? Children { get; set; }
}
