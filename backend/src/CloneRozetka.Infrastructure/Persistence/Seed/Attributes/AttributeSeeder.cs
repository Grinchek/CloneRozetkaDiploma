using CloneRozetka.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CloneRozetka.Infrastructure.Persistence.Seed.Attributes;

public static class AttributeSeeder
{
    public static async Task SeedAsync(AppDbContext db, string jsonPath)
    {
        if (!File.Exists(jsonPath))
            return;

        var json = await File.ReadAllTextAsync(jsonPath);
        var items = JsonSerializer.Deserialize<List<AttributeSeedCategoryModel>>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];

        if (items.Count == 0)
            return;

        var rootCategories = await db.Categories
            .AsNoTracking()
            .Where(c => c.ParentId == null)
            .ToDictionaryAsync(c => c.UrlSlug, c => c.Id);

        var existingAttrs = await db.Attributes.AsNoTracking()
            .ToDictionaryAsync(a => a.Slug ?? a.Name, a => a.Id);
        var existingBindings = await db.CategoryAttributes
            .AsNoTracking()
            .Select(ca => new { ca.CategoryId, ca.AttributeId })
            .ToListAsync();
        var bindingSet = existingBindings.Select(b => (b.CategoryId, b.AttributeId)).ToHashSet();

        var slugsToCreate = new Dictionary<string, (string Name, AttributeDataType DataType, string? Unit, List<string>? Options)>();
        foreach (var categoryItem in items)
        {
            if (string.IsNullOrWhiteSpace(categoryItem.CategorySlug) || categoryItem.Attributes == null)
                continue;
            if (!rootCategories.ContainsKey(categoryItem.CategorySlug.Trim()))
                continue;
            foreach (var attr in categoryItem.Attributes)
            {
                if (string.IsNullOrWhiteSpace(attr.Name) || string.IsNullOrWhiteSpace(attr.Slug))
                    continue;
                var slug = attr.Slug.Trim();
                if (existingAttrs.ContainsKey(slug))
                    continue;
                if (!slugsToCreate.ContainsKey(slug))
                    slugsToCreate[slug] = (attr.Name.Trim(), ParseDataType(attr.DataType),
                        string.IsNullOrWhiteSpace(attr.Unit) ? null : attr.Unit.Trim(),
                        attr.Options);
            }
        }

        if (slugsToCreate.Count > 0)
        {
            var newAttrs = slugsToCreate.Select(kv => new AttributeEntity
            {
                Name = kv.Value.Name,
                Slug = kv.Key,
                DataType = kv.Value.DataType,
                Unit = kv.Value.Unit
            }).ToList();
            await db.Attributes.AddRangeAsync(newAttrs);
            await db.SaveChangesAsync();
            foreach (var e in newAttrs)
                existingAttrs[e.Slug ?? e.Name] = e.Id;

            foreach (var e in newAttrs)
            {
                if (e.DataType != AttributeDataType.Enum || !slugsToCreate.TryGetValue(e.Slug!, out var meta) || meta.Options == null || meta.Options.Count == 0)
                    continue;
                var existingOpts = await db.AttributeOptions.AsNoTracking()
                    .Where(o => o.AttributeId == e.Id).Select(o => o.Value).ToHashSetAsync();
                foreach (var val in meta.Options)
                {
                    if (string.IsNullOrWhiteSpace(val) || existingOpts.Contains(val.Trim()))
                        continue;
                    await db.AttributeOptions.AddAsync(new AttributeOptionEntity { AttributeId = e.Id, Value = val.Trim() });
                    existingOpts.Add(val.Trim());
                }
            }
            await db.SaveChangesAsync();
        }

        var bindingsToAdd = new List<CategoryAttributeEntity>();
        foreach (var categoryItem in items)
        {
            if (string.IsNullOrWhiteSpace(categoryItem.CategorySlug) || categoryItem.Attributes == null || categoryItem.Attributes.Count == 0)
                continue;
            if (!rootCategories.TryGetValue(categoryItem.CategorySlug.Trim(), out var categoryId))
                continue;
            var sortOrder = 0;
            foreach (var attr in categoryItem.Attributes)
            {
                if (string.IsNullOrWhiteSpace(attr.Slug))
                    continue;
                var slug = attr.Slug.Trim();
                if (!existingAttrs.TryGetValue(slug, out var attributeId))
                    continue;
                if (!bindingSet.Add((categoryId, attributeId)))
                    continue;
                bindingsToAdd.Add(new CategoryAttributeEntity
                {
                    CategoryId = categoryId,
                    AttributeId = attributeId,
                    IsRequired = false,
                    SortOrder = sortOrder++,
                    IsFilterable = true
                });
            }
        }

        if (bindingsToAdd.Count > 0)
        {
            await db.CategoryAttributes.AddRangeAsync(bindingsToAdd);
            await db.SaveChangesAsync();
        }
    }

    private static AttributeDataType ParseDataType(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return AttributeDataType.String;
        return value.Trim().ToLowerInvariant() switch
        {
            "number" => AttributeDataType.Number,
            "bool" => AttributeDataType.Bool,
            "enum" => AttributeDataType.Enum,
            _ => AttributeDataType.String
        };
    }
}
