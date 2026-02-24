using CloneRozetka.Application.ProductAttributes.DTOs.Admin;
using CloneRozetka.Application.Search;

namespace CloneRozetka.Application.ProductAttributes;

public interface IAdminAttributesService
{
    Task<SearchResult<AdminAttributeListItemDto>> ListAttributesPagedAsync(int page, int pageSize, string? search, CancellationToken ct = default);
    Task<AdminAttributeDetailsDto?> GetAttributeByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAttributeAsync(AdminAttributeCreateRequest request, CancellationToken ct = default);
    Task UpdateAttributeAsync(int id, AdminAttributeUpdateRequest request, CancellationToken ct = default);
    Task DeleteAttributeAsync(int id, CancellationToken ct = default);

    Task<IReadOnlyList<AdminCategoryAttributeBindingDto>> GetCategoryAttributeBindingsAsync(int categoryId, CancellationToken ct = default);

    /// <summary>Returns direct bindings for the category and inherited bindings from parent chain (for admin UI).</summary>
    Task<AdminCategoryAttributeBindingsResponse> GetCategoryAttributeBindingsWithInheritedAsync(int categoryId, CancellationToken ct = default);

    Task SetCategoryAttributeBindingsAsync(int categoryId, AdminCategoryAttributeBindingUpdateRequest request, CancellationToken ct = default);
}
