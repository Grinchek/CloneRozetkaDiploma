using CloneRozetka.Application.ProductAttributes;
using CloneRozetka.Application.ProductAttributes.DTOs;
using CloneRozetka.Domain.Entities;
using CloneRozetka.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CloneRozetka.Infrastructure.Services.ProductAttributes;

public class CategoryAttributesService : ICategoryAttributesService
{
    private readonly AppDbContext _db;

    public CategoryAttributesService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CategoryAttributeItemDto>> GetAttributesForCategoryAsync(int categoryId, CancellationToken ct = default)
    {
        var path = await GetCategoryPathAsync(categoryId, ct);
        if (path.Count == 0)
            throw new KeyNotFoundException($"Category with id={categoryId} not found.");

        var pathSet = path.ToHashSet();
        var pathOrder = path.Select((id, idx) => (Id: id, Index: idx)).ToDictionary(x => x.Id, x => x.Index);

        var bindings = await _db.CategoryAttributes
            .AsNoTracking()
            .Where(ca => pathSet.Contains(ca.CategoryId))
            .Include(ca => ca.Attribute)
            .ToListAsync(ct);

        if (bindings.Count == 0)
            return Array.Empty<CategoryAttributeItemDto>();

        var byAttribute = bindings
            .GroupBy(ca => ca.AttributeId)
            .ToDictionary(g => g.Key, g => g.OrderBy(ca => pathOrder.GetValueOrDefault(ca.CategoryId, int.MaxValue)).First());

        var attributeIds = byAttribute.Keys.ToList();
        var attributes = await _db.Attributes
            .AsNoTracking()
            .Where(a => attributeIds.Contains(a.Id))
            .ToListAsync(ct);

        var options = await _db.AttributeOptions
            .AsNoTracking()
            .Where(o => attributeIds.Contains(o.AttributeId))
            .OrderBy(o => o.Id)
            .ToListAsync(ct);

        var optionsByAttr = options.GroupBy(o => o.AttributeId).ToDictionary(g => g.Key, g => g.ToList());

        var result = new List<CategoryAttributeItemDto>();
        foreach (var kv in byAttribute.OrderBy(x => x.Value.SortOrder))
        {
            var attrId = kv.Key;
            var binding = kv.Value;
            var attr = attributes.FirstOrDefault(a => a.Id == attrId);
            if (attr is null) continue;

            var optList = optionsByAttr.GetValueOrDefault(attrId, new List<AttributeOptionEntity>());
            result.Add(new CategoryAttributeItemDto(
                attrId,
                attr.Name,
                attr.DataType,
                attr.Unit,
                binding.IsRequired,
                binding.SortOrder,
                binding.IsFilterable,
                optList.Select(o => new AttributeOptionItemDto(o.Id, o.Value)).ToList()
            ));
        }

        return result;
    }

    /// <summary>
    /// Returns category id and all ancestor ids (category first, then parent, then grandparent, ...).
    /// </summary>
    internal async Task<IReadOnlyList<int>> GetCategoryPathAsync(int categoryId, CancellationToken ct)
    {
        var path = new List<int>();
        int? currentId = categoryId;
        var visited = new HashSet<int>();

        while (currentId.HasValue && visited.Add(currentId.Value))
        {
            var cat = await _db.Categories
                .AsNoTracking()
                .Where(c => c.Id == currentId.Value)
                .Select(c => new { c.Id, c.ParentId })
                .FirstOrDefaultAsync(ct);

            if (cat is null) break;
            path.Add(cat.Id);
            currentId = cat.ParentId;
        }

        return path;
    }
}
