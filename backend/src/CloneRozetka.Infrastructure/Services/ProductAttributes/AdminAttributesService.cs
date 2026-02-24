using CloneRozetka.Application.ProductAttributes;
using CloneRozetka.Application.ProductAttributes.DTOs.Admin;
using CloneRozetka.Application.Search;
using CloneRozetka.Domain.Entities;
using CloneRozetka.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CloneRozetka.Infrastructure.Services.ProductAttributes;

public class AdminAttributesService : IAdminAttributesService
{
    private readonly AppDbContext _db;

    public AdminAttributesService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<SearchResult<AdminAttributeListItemDto>> ListAttributesPagedAsync(int page, int pageSize, string? search, CancellationToken ct = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 10 : pageSize;

        var query = _db.Attributes.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(a =>
                a.Name.ToLower().Contains(term) ||
                (a.Slug != null && a.Slug.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync(ct);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .OrderBy(a => a.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AdminAttributeListItemDto(a.Id, a.Name, a.Slug, a.DataType, a.Unit))
            .ToListAsync(ct);

        return new SearchResult<AdminAttributeListItemDto>
        {
            Items = items,
            Pagination = new PaginationModel
            {
                TotalCount = totalCount,
                TotalPages = totalPages,
                ItemsPerPage = pageSize,
                CurrentPage = page
            }
        };
    }

    public async Task<AdminAttributeDetailsDto?> GetAttributeByIdAsync(int id, CancellationToken ct = default)
    {
        var attr = await _db.Attributes
            .AsNoTracking()
            .Where(a => a.Id == id)
            .Select(a => new
            {
                a.Id,
                a.Name,
                a.Slug,
                a.DataType,
                a.Unit,
                Options = a.Options!.OrderBy(o => o.Id).Select(o => new AdminAttributeOptionDto(o.Id, o.Value)).ToList()
            })
            .FirstOrDefaultAsync(ct);

        if (attr is null) return null;

        return new AdminAttributeDetailsDto(
            attr.Id,
            attr.Name,
            attr.Slug,
            attr.DataType,
            attr.Unit,
            attr.Options);
    }

    public async Task<int> CreateAttributeAsync(AdminAttributeCreateRequest request, CancellationToken ct = default)
    {
        var entity = new AttributeEntity
        {
            Name = request.Name.Trim(),
            Slug = string.IsNullOrWhiteSpace(request.Slug) ? null : request.Slug.Trim(),
            DataType = request.DataType,
            Unit = string.IsNullOrWhiteSpace(request.Unit) ? null : request.Unit.Trim()
        };
        _db.Attributes.Add(entity);
        await _db.SaveChangesAsync(ct);

        if (request.DataType == AttributeDataType.Enum && request.Options is { Count: > 0 })
        {
            foreach (var opt in request.Options)
            {
                if (string.IsNullOrWhiteSpace(opt.Value)) continue;
                _db.AttributeOptions.Add(new AttributeOptionEntity
                {
                    AttributeId = entity.Id,
                    Value = opt.Value.Trim()
                });
            }
            await _db.SaveChangesAsync(ct);
        }

        return entity.Id;
    }

    public async Task UpdateAttributeAsync(int id, AdminAttributeUpdateRequest request, CancellationToken ct = default)
    {
        var entity = await _db.Attributes
            .Include(a => a.Options)
            .FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new KeyNotFoundException($"Attribute with id={id} not found.");

        entity.Name = request.Name.Trim();
        entity.Slug = string.IsNullOrWhiteSpace(request.Slug) ? null : request.Slug.Trim();
        entity.DataType = request.DataType;
        entity.Unit = string.IsNullOrWhiteSpace(request.Unit) ? null : request.Unit.Trim();

        if (request.DataType == AttributeDataType.Enum && request.Options is { Count: >= 0 })
        {
            var existingIds = request.Options.Where(x => x.Id.HasValue).Select(x => x.Id!.Value).ToHashSet();
            var toRemove = entity.Options!.Where(o => !existingIds.Contains(o.Id)).ToList();
            if (toRemove.Count > 0)
                _db.AttributeOptions.RemoveRange(toRemove);

            foreach (var item in request.Options)
            {
                if (string.IsNullOrWhiteSpace(item.Value)) continue;
                if (item.Id is null)
                {
                    _db.AttributeOptions.Add(new AttributeOptionEntity { AttributeId = id, Value = item.Value.Trim() });
                }
                else
                {
                    var opt = entity.Options!.FirstOrDefault(o => o.Id == item.Id.Value);
                    if (opt != null)
                        opt.Value = item.Value.Trim();
                }
            }
        }
        else if (request.DataType != AttributeDataType.Enum && entity.Options is { Count: > 0 })
        {
            _db.AttributeOptions.RemoveRange(entity.Options);
        }

        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAttributeAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.Attributes.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Attribute with id={id} not found.");

        var productValues = await _db.ProductAttributeValues.Where(pav => pav.AttributeId == id).ToListAsync(ct);
        var categoryAttrs = await _db.CategoryAttributes.Where(ca => ca.AttributeId == id).ToListAsync(ct);

        if (productValues.Count > 0)
            _db.ProductAttributeValues.RemoveRange(productValues);
        if (categoryAttrs.Count > 0)
            _db.CategoryAttributes.RemoveRange(categoryAttrs);

        _db.Attributes.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<AdminCategoryAttributeBindingDto>> GetCategoryAttributeBindingsAsync(int categoryId, CancellationToken ct = default)
    {
        var exists = await _db.Categories.AsNoTracking().AnyAsync(c => c.Id == categoryId, ct);
        if (!exists)
            throw new KeyNotFoundException($"Category with id={categoryId} not found.");

        var list = await _db.CategoryAttributes
            .AsNoTracking()
            .Where(ca => ca.CategoryId == categoryId)
            .Include(ca => ca.Attribute)
            .OrderBy(ca => ca.SortOrder)
            .ThenBy(ca => ca.Attribute!.Name)
            .Select(ca => new AdminCategoryAttributeBindingDto(
                ca.AttributeId,
                ca.Attribute!.Name,
                ca.IsRequired,
                ca.SortOrder,
                ca.IsFilterable))
            .ToListAsync(ct);

        return list;
    }

    public async Task<AdminCategoryAttributeBindingsResponse> GetCategoryAttributeBindingsWithInheritedAsync(int categoryId, CancellationToken ct = default)
    {
        var path = await GetCategoryPathAsync(categoryId, ct);
        if (path.Count == 0)
            throw new KeyNotFoundException($"Category with id={categoryId} not found.");

        var direct = await GetCategoryAttributeBindingsAsync(categoryId, ct);

        var inherited = new List<AdminInheritedAttributeBindingDto>();
        foreach (var ancestorId in path.Skip(1))
        {
            var cat = await _db.Categories.AsNoTracking()
                .Where(c => c.Id == ancestorId)
                .Select(c => new { c.Id, c.Name })
                .FirstOrDefaultAsync(ct);
            if (cat is null) continue;

            var bindings = await _db.CategoryAttributes
                .AsNoTracking()
                .Where(ca => ca.CategoryId == ancestorId)
                .Include(ca => ca.Attribute)
                .OrderBy(ca => ca.SortOrder)
                .ThenBy(ca => ca.Attribute!.Name)
                .Select(ca => new AdminInheritedAttributeBindingDto(
                    ca.AttributeId,
                    ca.Attribute!.Name,
                    ca.IsRequired,
                    ca.SortOrder,
                    ca.IsFilterable,
                    ancestorId,
                    cat.Name))
                .ToListAsync(ct);
            inherited.AddRange(bindings);
        }

        return new AdminCategoryAttributeBindingsResponse(direct, inherited);
    }

    private async Task<IReadOnlyList<int>> GetCategoryPathAsync(int categoryId, CancellationToken ct)
    {
        var path = new List<int>();
        int? currentId = categoryId;
        var visited = new HashSet<int>();
        while (currentId.HasValue && visited.Add(currentId.Value))
        {
            var cat = await _db.Categories.AsNoTracking()
                .Where(c => c.Id == currentId.Value)
                .Select(c => new { c.Id, c.ParentId })
                .FirstOrDefaultAsync(ct);
            if (cat is null) break;
            path.Add(cat.Id);
            currentId = cat.ParentId;
        }
        return path;
    }

    public async Task SetCategoryAttributeBindingsAsync(int categoryId, AdminCategoryAttributeBindingUpdateRequest request, CancellationToken ct = default)
    {
        var categoryExists = await _db.Categories.AsNoTracking().AnyAsync(c => c.Id == categoryId, ct);
        if (!categoryExists)
            throw new KeyNotFoundException($"Category with id={categoryId} not found.");

        var bindings = request.Bindings?.ToList() ?? new List<AdminCategoryAttributeBindingUpdateItem>();
        var attributeIds = bindings.Select(b => b.AttributeId).Distinct().ToList();
        if (attributeIds.Count != bindings.Count)
            throw new InvalidOperationException("Duplicate AttributeId in bindings.");

        var existingAttrs = await _db.Attributes.AsNoTracking().Where(a => attributeIds.Contains(a.Id)).Select(a => a.Id).ToListAsync(ct);
        var missing = attributeIds.Except(existingAttrs).ToList();
        if (missing.Count > 0)
            throw new InvalidOperationException($"Attributes not found: {string.Join(", ", missing)}.");

        var current = await _db.CategoryAttributes.Where(ca => ca.CategoryId == categoryId).ToListAsync(ct);
        _db.CategoryAttributes.RemoveRange(current);

        foreach (var b in bindings)
        {
            _db.CategoryAttributes.Add(new CategoryAttributeEntity
            {
                CategoryId = categoryId,
                AttributeId = b.AttributeId,
                IsRequired = b.IsRequired,
                SortOrder = b.SortOrder,
                IsFilterable = b.IsFilterable
            });
        }

        await _db.SaveChangesAsync(ct);
    }
}
