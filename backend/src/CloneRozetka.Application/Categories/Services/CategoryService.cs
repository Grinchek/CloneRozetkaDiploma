using AutoMapper;
using AutoMapper.QueryableExtensions;
using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Categories.DTOs;
using CloneRozetka.Domain.Entities;

namespace CloneRozetka.Application.Categories;

// Реалізація повністю відповідає ICategoryService
public class CategoryService : ICategoryService
{
    private readonly IRepository<Category> _repo;
    private readonly IImageService _images;
    private readonly IMapper _mapper;

    public CategoryService(
        IRepository<Category> repo,
        IImageService images,
        IMapper mapper)
    {
        _repo = repo;
        _images = images;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<CategoryDto>> ListAsync(CancellationToken ct = default)
        => await _repo.ToListAsync(
            _repo.Query(asNoTracking: true)
                 .Where(x => !x.IsDeleted)
                 .ProjectTo<CategoryDto>(_mapper.ConfigurationProvider),
            ct);

    public async Task<CategoryDto?> GetAsync(int id, CancellationToken ct = default)
        => await _repo.FirstOrDefaultAsync(
            _repo.Query(asNoTracking: true)
                 .Where(x => x.Id == id && !x.IsDeleted)
                 .ProjectTo<CategoryDto>(_mapper.ConfigurationProvider),
            ct);

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
            entity.Image = await _images.SaveImageAsync(req.Image);
        await _repo.AddAsync(entity, ct);
        return entity.Id;
    }

    public async Task UpdateAsync(CategoryUpdateRequest req, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(req.Id, ct)
                     ?? throw new KeyNotFoundException("Category not found");

        entity.Name = req.Name;
        entity.Priority = req.Priority;
        entity.UrlSlug = req.UrlSlug;
        entity.ParentId = req.ParentId;

        if (req.Image is not null)
        {
            if (!string.IsNullOrWhiteSpace(entity.Image))
                await _images.DeleteImageAsync(entity.Image);

            entity.Image = await _images.SaveImageAsync(req.Image);
        }

        await _repo.UpdateAsync(entity, ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, ct)
                     ?? throw new KeyNotFoundException("Category not found");

        entity.IsDeleted = true;
        await _repo.UpdateAsync(entity, ct);
    }
}
