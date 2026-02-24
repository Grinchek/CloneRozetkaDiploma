using CloneRozetka.Domain.Entities;

namespace CloneRozetka.Application.ProductAttributes.DTOs.Admin;

/// <summary>Id = null means create new option; existing Id means update; options not in list are deleted.</summary>
public record AdminAttributeOptionUpdateItemDto(int? Id, string Value);

public record AdminAttributeUpdateRequest(
    string Name,
    string? Slug,
    AttributeDataType DataType,
    string? Unit,
    IReadOnlyList<AdminAttributeOptionUpdateItemDto>? Options = null
);
