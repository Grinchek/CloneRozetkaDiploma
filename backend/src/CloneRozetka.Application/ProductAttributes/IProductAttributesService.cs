using CloneRozetka.Application.ProductAttributes.DTOs;

namespace CloneRozetka.Application.ProductAttributes;

public interface IProductAttributesService
{
    Task<IReadOnlyList<ProductAttributeValueDto>> GetProductAttributesAsync(long productId, CancellationToken ct = default);
    Task SetProductAttributesAsync(long productId, ProductAttributeValueUpsertRequest request, CancellationToken ct = default);
}
