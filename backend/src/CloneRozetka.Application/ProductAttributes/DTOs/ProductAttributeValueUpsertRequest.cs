namespace CloneRozetka.Application.ProductAttributes.DTOs;

public record ProductAttributeValueUpsertItem(
    int AttributeId,
    string? ValueString,
    decimal? ValueNumber,
    bool? ValueBool,
    int? OptionId
);

public record ProductAttributeValueUpsertRequest(IReadOnlyList<ProductAttributeValueUpsertItem> Values);
