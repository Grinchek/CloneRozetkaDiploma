using CloneRozetka.Domain.Entities;

namespace CloneRozetka.Application.ProductAttributes.DTOs.Admin;

public record AdminAttributeOptionItemDto(string Value);

public record AdminAttributeCreateRequest(
    string Name,
    string? Slug,
    AttributeDataType DataType,
    string? Unit,
    IReadOnlyList<AdminAttributeOptionItemDto>? Options = null
);
