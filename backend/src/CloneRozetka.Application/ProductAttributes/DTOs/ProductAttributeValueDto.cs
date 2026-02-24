namespace CloneRozetka.Application.ProductAttributes.DTOs;

public record ProductAttributeValueDto(
    int AttributeId,
    string? ValueString,
    decimal? ValueNumber,
    bool? ValueBool,
    int? OptionId
);
