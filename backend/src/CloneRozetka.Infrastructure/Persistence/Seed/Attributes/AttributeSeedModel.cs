namespace CloneRozetka.Infrastructure.Persistence.Seed.Attributes;

/// <summary>
/// One category + list of attributes to bind (5 per root category).
/// </summary>
public sealed class AttributeSeedCategoryModel
{
    public string CategorySlug { get; set; } = default!;
    public List<AttributeSeedItemModel> Attributes { get; set; } = new();
}

public sealed class AttributeSeedItemModel
{
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    /// <summary>String | Number | Bool | Enum</summary>
    public string DataType { get; set; } = "String";
    public string? Unit { get; set; }
    /// <summary>For Enum: list of option values.</summary>
    public List<string>? Options { get; set; }
}
