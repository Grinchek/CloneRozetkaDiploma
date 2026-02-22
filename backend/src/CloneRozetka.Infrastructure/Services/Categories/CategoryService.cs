using AutoMapper;
using AutoMapper.QueryableExtensions;
using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Categories.DTOs;
using CloneRozetka.Application.Categories.Interfaces;
using CloneRozetka.Application.Search;
using CloneRozetka.Application.Search.Params;
using CloneRozetka.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CloneRozetka.Application.Categories;

public class CategoryService : ICategoryService
{
    private readonly IRepository<CategoryEntity> _repo;
    private readonly IImageService _images;
    private readonly IMapper _mapper;

    public CategoryService(
        IRepository<CategoryEntity> repo,
        IImageService images,
        IMapper mapper)
    {
        _repo = repo;
        _images = images;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<CategoryDto>> ListAsync()
        => await _repo.ToListAsync(
            _repo.Query(asNoTracking: true)
                 .Where(x => !x.IsDeleted)
                 .ProjectTo<CategoryDto>(_mapper.ConfigurationProvider));
    public async Task<PagedResponse<CategoryDto>> ListPagedAsync(int page, int pageSize, string? search = null, bool? isDeleted = null)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 10 : pageSize;

        var query = _repo.Query(asNoTracking: true);

        if (isDeleted == true)
            query = query.Where(x => x.IsDeleted);
        else if (isDeleted == false)
            query = query.Where(x => !x.IsDeleted);
        // isDeleted == null: no filter (all)

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x =>
                x.Name.ToLower().Contains(term) ||
                (x.UrlSlug != null && x.UrlSlug.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .OrderBy(x => x.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<CategoryDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return new PagedResponse<CategoryDto>
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
    public async Task<CategoryDto?> GetAsync(int id)
        => await _repo.FirstOrDefaultAsync(
            _repo.Query(asNoTracking: true)
                 .Where(x => x.Id == id && !x.IsDeleted)
                 .ProjectTo<CategoryDto>(_mapper.ConfigurationProvider));

    public async Task<int> CreateAsync(CategoryCreateRequest req)
    {
        var entity = new CategoryEntity
        {
            Name = req.Name,
            Priority = req.Priority,
            UrlSlug = req.UrlSlug,
            ParentId = req.ParentId
        };

        if (req.Image is not null)
            entity.Image = await _images.SaveImageAsync(req.Image);
        await _repo.AddAsync(entity);
        return entity.Id;
    }

    public async Task UpdateAsync(CategoryUpdateRequest req)
    {
        var entity = await _repo.GetByIdAsync(req.Id)
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

        await _repo.UpdateAsync(entity);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id)
                     ?? throw new KeyNotFoundException("Category not found");

        entity.IsDeleted = true;
        await _repo.UpdateAsync(entity);
    }

    public async Task RestoreAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id)
                     ?? throw new KeyNotFoundException("Category not found");

        entity.IsDeleted = false;
        await _repo.UpdateAsync(entity);
    }

    public async Task<SearchResult<CategoryDto>> SearchCategoriesAsync(CategorySearchModel model)
    {
        // базовий запит
        var query = _repo.Query(asNoTracking: true)
                         .Where(c => !c.IsDeleted);

        // фільтрація по імені
        if (!string.IsNullOrWhiteSpace(model.Name))
        {
            var nameFilter = model.Name.Trim().ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(nameFilter));
        }

        // загальна к-сть елементів після фільтрацій
        var totalCount = await query.CountAsync();

        // безпечні значення пагінації
        var safeItemsPerPage = model.ItemPerPAge < 1 ? 10 : model.ItemPerPAge;
        var totalPages = (int)Math.Ceiling(totalCount / (double)safeItemsPerPage);
        var safePage = Math.Min(Math.Max(1, model.Page), Math.Max(1, totalPages));

        // завантаження поточної сторінки
        var categories = await query
            .OrderBy(c => c.Id) 
            .Skip((safePage - 1) * safeItemsPerPage)
            .Take(safeItemsPerPage)
            .ProjectTo<CategoryDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return new SearchResult<CategoryDto>
        {
            Items = categories,
            Pagination = new PaginationModel
            {
                TotalCount = totalCount,
                TotalPages = totalPages,
                ItemsPerPage = safeItemsPerPage,
                CurrentPage = safePage
            }
        };
    }
}
