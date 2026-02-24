using CloneRozetka.Application.ProductAttributes;
using CloneRozetka.Application.ProductAttributes.DTOs;
using CloneRozetka.Domain.Entities;
using CloneRozetka.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CloneRozetka.Infrastructure.Services.ProductAttributes;

public class ProductAttributesService : IProductAttributesService
{
    private readonly AppDbContext _db;
    private readonly ICategoryAttributesService _categoryAttributesService;

    public ProductAttributesService(AppDbContext db, ICategoryAttributesService categoryAttributesService)
    {
        _db = db;
        _categoryAttributesService = categoryAttributesService;
    }

    public async Task<IReadOnlyList<ProductAttributeValueDto>> GetProductAttributesAsync(long productId, CancellationToken ct = default)
    {
        var productExists = await _db.Products.AsNoTracking().AnyAsync(p => p.Id == productId && !p.IsDeleted, ct);
        if (!productExists)
            throw new KeyNotFoundException($"Product with id={productId} not found.");

        var list = await _db.ProductAttributeValues
            .AsNoTracking()
            .Where(pav => pav.ProductId == productId)
            .Select(pav => new ProductAttributeValueDto(
                pav.AttributeId,
                pav.ValueString,
                pav.ValueNumber,
                pav.ValueBool,
                pav.OptionId
            ))
            .ToListAsync(ct);
        return list;
    }

    public async Task SetProductAttributesAsync(long productId, ProductAttributeValueUpsertRequest request, CancellationToken ct = default)
    {
        var product = await _db.Products
            .AsNoTracking()
            .Where(p => p.Id == productId && !p.IsDeleted)
            .Select(p => new { p.Id, p.CategoryId })
            .FirstOrDefaultAsync(ct);

        if (product is null)
            throw new KeyNotFoundException($"Product with id={productId} not found.");

        var allowed = await _categoryAttributesService.GetAttributesForCategoryAsync(product.CategoryId, ct);
        var allowedIds = allowed.Select(a => a.AttributeId).ToHashSet();
        var allowedByAttr = allowed.ToDictionary(a => a.AttributeId);

        var attrEntities = await _db.Attributes
            .AsNoTracking()
            .Where(a => allowedIds.Contains(a.Id))
            .ToDictionaryAsync(a => a.Id, ct);

        var incoming = request.Values?.ToList() ?? new List<ProductAttributeValueUpsertItem>();
        var incomingIds = incoming.Select(x => x.AttributeId).ToHashSet();

        foreach (var item in incoming)
        {
            if (!allowedIds.Contains(item.AttributeId))
                throw new InvalidOperationException($"Attribute id {item.AttributeId} is not allowed for this product's category.");
            var attr = attrEntities.GetValueOrDefault(item.AttributeId);
            if (attr is null) continue;
            ValidateValue(attr, item, allowedByAttr);
        }

        var existing = await _db.ProductAttributeValues
            .Where(pav => pav.ProductId == productId)
            .ToListAsync(ct);

        var toRemove = existing.Where(e => !incomingIds.Contains(e.AttributeId)).ToList();
        var toAdd = new List<ProductAttributeValueEntity>();
        var toUpdate = new List<ProductAttributeValueEntity>();

        foreach (var item in incoming)
        {
            var e = existing.FirstOrDefault(x => x.AttributeId == item.AttributeId);
            if (e is null)
            {
                toAdd.Add(MapToEntity(productId, item));
            }
            else
            {
                SetValues(e, item);
                toUpdate.Add(e);
            }
        }

        if (toRemove.Count > 0)
            _db.ProductAttributeValues.RemoveRange(toRemove);
        foreach (var e in toUpdate)
            _db.ProductAttributeValues.Update(e);
        if (toAdd.Count > 0)
            await _db.ProductAttributeValues.AddRangeAsync(toAdd, ct);

        await _db.SaveChangesAsync(ct);
    }

    private static void ValidateValue(AttributeEntity attr, ProductAttributeValueUpsertItem item, IReadOnlyDictionary<int, CategoryAttributeItemDto> allowedByAttr)
    {
        switch (attr.DataType)
        {
            case AttributeDataType.Enum:
                if (item.OptionId is null)
                    throw new InvalidOperationException($"Attribute {attr.Name} (Enum) requires OptionId.");
                if (allowedByAttr.TryGetValue(attr.Id, out var catAttr) &&
                    !catAttr.Options.Any(o => o.Id == item.OptionId.Value))
                    throw new InvalidOperationException($"OptionId {item.OptionId} is not valid for attribute {attr.Name}.");
                break;
            case AttributeDataType.String:
            case AttributeDataType.Number:
            case AttributeDataType.Bool:
                break;
        }
    }

    private static ProductAttributeValueEntity MapToEntity(long productId, ProductAttributeValueUpsertItem item)
    {
        return new ProductAttributeValueEntity
        {
            ProductId = productId,
            AttributeId = item.AttributeId,
            ValueString = item.ValueString,
            ValueNumber = item.ValueNumber,
            ValueBool = item.ValueBool,
            OptionId = item.OptionId
        };
    }

    private static void SetValues(ProductAttributeValueEntity e, ProductAttributeValueUpsertItem item)
    {
        e.ValueString = item.ValueString;
        e.ValueNumber = item.ValueNumber;
        e.ValueBool = item.ValueBool;
        e.OptionId = item.OptionId;
    }
}
