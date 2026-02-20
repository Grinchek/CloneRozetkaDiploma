using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Products.DTOs;
using CloneRozetka.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class ProductService : IProductService
{
    private readonly IRepository<ProductEntity> _products;
    private readonly IRepository<ProductImageEntity> _images;
    private readonly IImageService _imageService;

    public ProductService(
        IRepository<ProductEntity> products,
        IRepository<ProductImageEntity> images,
        IImageService imageService)
    {
        _products = products;
        _images = images;
        _imageService = imageService;
    }

    public async Task<IReadOnlyList<ProductListItemDto>> ListAllAsync(CancellationToken ct = default)
    {
        var query = _products.Query(asNoTracking: true)
            .OrderBy(p => p.Id)
            .Select(p => new ProductListItemDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Slug = p.Slug,
                CategoryId = p.CategoryId,
                MainImageUrl = _images.Query(true)
                    .Where(i => i.ProductId == p.Id)
                    .OrderBy(i => i.Priority)
                    .Select(i => i.Name)
                    .FirstOrDefault()
            });
        return await _products.ToListAsync(query, ct);
    }

    public async Task<SearchResult<ProductListItemDto>> ListPagedAsync(int page, int itemsPerPage, CancellationToken ct = default)
    {
        page = page < 1 ? 1 : page;
        itemsPerPage = itemsPerPage < 1 ? 10 : itemsPerPage;

        var query = _products.Query(asNoTracking: true);

        var totalCount = await query.CountAsync(ct);
        var totalPages = (int)Math.Ceiling(totalCount / (double)itemsPerPage);

        // Для MainImageUrl нам треба підзапит по ProductImages.
        // Зробимо це через join-підзапит у Select (EF згенерує підзапит SQL).
        var itemsQuery =
            query
                .OrderBy(p => p.Id)
                .Skip((page - 1) * itemsPerPage)
                .Take(itemsPerPage)
                .Select(p => new ProductListItemDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    Slug = p.Slug,
                    CategoryId = p.CategoryId,

                    MainImageUrl = _images.Query(true)
                        .Where(i => i.ProductId == p.Id)
                        .OrderBy(i => i.Priority)
                        .Select(i => i.Name)
                        .FirstOrDefault()
                });

        var items = await _products.ToListAsync(itemsQuery, ct);

        return new SearchResult<ProductListItemDto>
        {
            Items = items,
            Pagination = new PaginationModel
            {
                TotalCount = totalCount,
                TotalPages = totalPages,
                ItemsPerPage = itemsPerPage,
                CurrentPage = page
            }
        };
    }

    public async Task<ProductDetailsDto> GetByIdAsync(long id, CancellationToken ct = default)
    {
        var query = _products.Query(asNoTracking: true)
            .Where(p => p.Id == id)
            .Select(p => new ProductDetailsDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Slug = p.Slug,
                Description = p.Description,
                CategoryId = p.CategoryId,

                ImageUrls = _images.Query(true)
                    .Where(i => i.ProductId == p.Id)
                    .OrderBy(i => i.Priority)
                    .Select(i => i.Name)
                    .ToList()
            });

        var dto = await _products.FirstOrDefaultAsync(query, ct);

        if (dto is null)
            throw new KeyNotFoundException($"Product with id={id} not found");

        return dto;
    }

    public async Task<long> CreateAsync(ProductCreateRequest request, CancellationToken ct = default)
    {
        var product = new ProductEntity
        {
            Name = request.Name,
            Slug = request.Slug,
            Price = request.Price,
            Description = request.Description,
            CategoryId = request.CategoryId
        };

        // AddAsync вже робить SaveChanges
        var created = await _products.AddAsync(product, ct);

        if (request.Images is { Count: > 0 })
        {
            short priority = 1;

            foreach (var file in request.Images.Where(f => f is { Length: > 0 }))
            {
                var savedName = await _imageService.SaveImageAsync(file);

                await _images.AddAsync(new ProductImageEntity
                {
                    ProductId = created.Id,
                    Name = savedName,
                    Priority = priority++
                }, ct);
            }
        }

        return created.Id;
    }

    public async Task UpdateAsync(long id, ProductUpdateRequest request, CancellationToken ct = default)
    {
        // Твій GetByIdAsync(int id) не підходить, тому тягнемо через Query
        var product = await _products.Query(asNoTracking: false)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (product is null)
            throw new KeyNotFoundException($"Product with id={id} not found");

        product.Name = request.Name;
        product.Slug = request.Slug;
        product.Price = request.Price;
        product.Description = request.Description;
        product.CategoryId = request.CategoryId;

        await _products.UpdateAsync(product, ct);

        // Додати нові зображення (старі лишаємо)
        if (request.NewImages is { Count: > 0 })
        {
            // Визначаємо наступний пріоритет
            short nextPriority = 1;
            var maxPriority = await _images.Query(true)
                .Where(i => i.ProductId == id)
                .Select(i => (short?)i.Priority)
                .MaxAsync(ct);

            if (maxPriority.HasValue)
                nextPriority = (short)(maxPriority.Value + 1);

            foreach (var file in request.NewImages.Where(f => f is { Length: > 0 }))
            {
                var savedName = await _imageService.SaveImageAsync(file);

                await _images.AddAsync(new ProductImageEntity
                {
                    ProductId = id,
                    Name = savedName,
                    Priority = nextPriority++
                }, ct);
            }
        }
    }

    public async Task DeleteAsync(long id, CancellationToken ct = default)
    {
        var product = await _products.Query(asNoTracking: false)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (product is null)
            throw new KeyNotFoundException($"Product with id={id} not found");

        // (опційно) видалити файли з диска
        var imgs = await _images.ListAsync(i => i.ProductId == id, ct);
        foreach (var img in imgs)
        {
            await _imageService.DeleteImageAsync(img.Name);
            await _images.DeleteAsync(img, ct);
        }

        await _products.DeleteAsync(product, ct);
    }
}
