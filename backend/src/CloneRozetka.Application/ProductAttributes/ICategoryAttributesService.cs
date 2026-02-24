using CloneRozetka.Application.ProductAttributes.DTOs;

namespace CloneRozetka.Application.ProductAttributes;

public interface ICategoryAttributesService
{
    /// <summary>
    /// Returns attributes available for the category (including inherited from parent categories).
    /// Child category overrides parent for same AttributeId (IsRequired, SortOrder, IsFilterable).
    /// </summary>
    Task<IReadOnlyList<CategoryAttributeItemDto>> GetAttributesForCategoryAsync(int categoryId, CancellationToken ct = default);
}
