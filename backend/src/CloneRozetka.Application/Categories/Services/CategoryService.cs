using AutoMapper;
using AutoMapper.QueryableExtensions;
using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Categories.DTOs;
using CloneRozetka.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class CategoryService(
    IRepository<Category> repo,
    IImageService images,
    IMapper mapper) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryDto>> ListAsync(CancellationToken ct = default) =>
        await repo.Query().AsNoTracking()
                  .Where(x => !x.IsDeleted)
                  .ProjectTo<CategoryDto>(mapper.ConfigurationProvider)
                  .ToListAsync(ct);

    public async Task<CategoryDto?> GetAsync(int id, CancellationToken ct = default) =>
        await repo.Query().AsNoTracking()
                  .Where(x => x.Id == id && !x.IsDeleted)
                  .ProjectTo<CategoryDto>(mapper.ConfigurationProvider)
                  .FirstOrDefaultAsync(ct);

    public async Task<int> CreateAsync(CategoryCreateRequest req, CancellationToken ct = default)
    {
        var entity = new Category
        {
            Name = req.Name,
            Priority = req.Priority,
            UrlSlug = req.UrlSlug,
            ParentId = req.ParentId
        };

        if (req.Image is not null)
            entity.Image = await images.SaveImageAsync(req.Image, ct);

        await repo.AddAsync(entity, ct);
        return entity.Id;
    }

    public async Task UpdateAsync(CategoryUpdateRequest req, CancellationToken ct = default)
    {
        var entity = await repo.GetByIdAsync(req.Id, ct)
                     ?? throw new KeyNotFoundException("Category not found");

        entity.Name = req.Name;
        entity.Priority = req.Priority;
        entity.UrlSlug = req.UrlSlug;
        entity.ParentId = req.ParentId;

        if (req.Image is not null)
        {
            if (!string.IsNullOrWhiteSpace(entity.Image))
                await images.DeleteImageAsync(entity.Image);
            entity.Image = await images.SaveImageAsync(req.Image, ct);
        }

        await repo.UpdateAsync(entity, ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await repo.GetByIdAsync(id, ct)
                     ?? throw new KeyNotFoundException("Category not found");
        entity.IsDeleted = true;
        await repo.UpdateAsync(entity, ct);
    }
}
