using CloneRozetka.Application.Products.DTOs;

public interface IProductService
{
    Task<IReadOnlyList<ProductListItemDto>> ListAllAsync(CancellationToken ct = default);
    Task<SearchResult<ProductListItemDto>> ListPagedAsync(int page, int itemsPerPage, CancellationToken ct = default);
    Task<ProductDetailsDto> GetByIdAsync(long id, CancellationToken ct = default);

    Task<long> CreateAsync(ProductCreateRequest request, CancellationToken ct = default);
    Task UpdateAsync(long id, ProductUpdateRequest request, CancellationToken ct = default);

    Task DeleteAsync(long id, CancellationToken ct = default);
}
