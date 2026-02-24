using CloneRozetka.Domain.Entities;

namespace CloneRozetka.Application.ProductAttributes.DTOs;

public record CategoryAttributeItemDto(
    int AttributeId,
    string Name,
    AttributeDataType DataType,
    string? Unit,
    bool IsRequired,
    int SortOrder,
    bool IsFilterable,
    IReadOnlyList<AttributeOptionItemDto> Options
);
