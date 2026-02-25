using CloneRozetka.Application.Compare;
using CloneRozetka.Application.Compare.DTOs;
using CloneRozetka.Application.ProductAttributes;
using CloneRozetka.Application.ProductAttributes.DTOs;
using CloneRozetka.Domain.Entities;
using CloneRozetka.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CloneRozetka.Infrastructure.Services.Compare;

public class CompareService : ICompareService
{
    private const int MaxCompareItems = 4;

    private readonly AppDbContext _db;
    private readonly ICategoryAttributesService _categoryAttributesService;

    public CompareService(AppDbContext db, ICategoryAttributesService categoryAttributesService)
    {
        _db = db;
        _categoryAttributesService = categoryAttributesService;
    }

    public async Task<IReadOnlyList<CompareProductDto>> GetCompareAsync(int userId, CancellationToken ct = default)
    {
        var items = await _db.CompareItems
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new { c.ProductId })
            .ToListAsync(ct);

        if (items.Count == 0)
            return Array.Empty<CompareProductDto>();

        var productIds = items.Select(x => x.ProductId).Distinct().ToList();
        var products = await _db.Products
            .AsNoTracking()
            .Where(p => productIds.Contains(p.Id) && !p.IsDeleted)
            .Select(p => new { p.Id, p.Name, p.Slug, p.Price, p.CategoryId })
            .ToDictionaryAsync(p => p.Id, ct);

        var mainImages = await _db.ProductImages
            .AsNoTracking()
            .Where(i => productIds.Contains(i.ProductId))
            .GroupBy(i => i.ProductId)
            .Select(g => new { ProductId = g.Key, Name = g.OrderBy(x => x.Priority).Select(x => x.Name).FirstOrDefault() })
            .ToDictionaryAsync(x => x.ProductId, x => x.Name, ct);

        var order = items.Select(x => x.ProductId).ToList();
        var result = new List<CompareProductDto>();

        foreach (var productId in order)
        {
            if (!products.TryGetValue(productId, out var p))
                continue;

            var categoryAttrs = await _categoryAttributesService.GetAttributesForCategoryAsync(p.CategoryId, ct);
            var pavList = await _db.ProductAttributeValues
                .AsNoTracking()
                .Where(pav => pav.ProductId == productId)
                .Select(pav => new ProductAttributeValueDto(pav.AttributeId, pav.ValueString, pav.ValueNumber, pav.ValueBool, pav.OptionId))
                .ToListAsync(ct);

            var attrById = categoryAttrs.ToDictionary(a => a.AttributeId);
            var specs = new List<CompareSpecItemDto>();
            foreach (var pav in pavList)
            {
                if (!attrById.TryGetValue(pav.AttributeId, out var catAttr))
                    continue;
                var displayValue = FormatDisplayValue(pav, catAttr);
                specs.Add(new CompareSpecItemDto
                {
                    AttributeId = pav.AttributeId,
                    AttributeName = catAttr.Name,
                    SortOrder = catAttr.SortOrder,
                    DisplayValue = displayValue
                });
            }

            result.Add(new CompareProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Slug = p.Slug,
                Price = p.Price,
                CategoryId = p.CategoryId,
                MainImageUrl = mainImages.GetValueOrDefault(productId),
                Specifications = specs.OrderBy(s => s.SortOrder).ToList()
            });
        }

        return result;
    }

    public async Task<bool> AddAsync(int userId, long productId, CancellationToken ct = default)
    {
        var count = await _db.CompareItems.CountAsync(c => c.UserId == userId, ct);
        if (count >= MaxCompareItems)
            return false;

        var exists = await _db.CompareItems.AnyAsync(c => c.UserId == userId && c.ProductId == productId, ct);
        if (exists)
            return true;

        var productExists = await _db.Products.AnyAsync(p => p.Id == productId && !p.IsDeleted, ct);
        if (!productExists)
            return false;

        _db.CompareItems.Add(new CompareItemEntity
        {
            UserId = userId,
            ProductId = productId
        });
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> RemoveAsync(int userId, long productId, CancellationToken ct = default)
    {
        var item = await _db.CompareItems.FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId, ct);
        if (item == null)
            return false;

        _db.CompareItems.Remove(item);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task ClearAsync(int userId, CancellationToken ct = default)
    {
        var items = await _db.CompareItems.Where(c => c.UserId == userId).ToListAsync(ct);
        if (items.Count > 0)
        {
            _db.CompareItems.RemoveRange(items);
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task<bool> IsInCompareAsync(int userId, long productId, CancellationToken ct = default)
    {
        return await _db.CompareItems.AnyAsync(c => c.UserId == userId && c.ProductId == productId, ct);
    }

    public async Task<IReadOnlyList<long>> GetCompareProductIdsAsync(int userId, CancellationToken ct = default)
    {
        return await _db.CompareItems
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => c.ProductId)
            .ToListAsync(ct);
    }

    private static string FormatDisplayValue(ProductAttributeValueDto pav, CategoryAttributeItemDto attr)
    {
        if (pav.ValueString != null && pav.ValueString != "")
            return pav.ValueString;
        if (pav.ValueNumber != null)
        {
            var unit = attr.Unit != null ? " " + attr.Unit : "";
            return pav.ValueNumber.Value.ToString("G29") + unit;
        }
        if (pav.ValueBool != null)
            return pav.ValueBool.Value ? "Так" : "Ні";
        if (pav.OptionId != null && attr.Options.Count > 0)
        {
            var opt = attr.Options.FirstOrDefault(o => o.Id == pav.OptionId.Value);
            return opt?.Value ?? pav.OptionId.Value.ToString();
        }
        return "—";
    }
}
