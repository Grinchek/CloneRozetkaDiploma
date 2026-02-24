using CloneRozetka.Domain.Entities;

namespace CloneRozetka.Application.ProductAttributes.DTOs.Admin;

public record AdminAttributeListItemDto(
    int Id,
    string Name,
    string? Slug,
    AttributeDataType DataType,
    string? Unit
);
