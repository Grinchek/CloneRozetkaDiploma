using CloneRozetka.Domain.Entities;

namespace CloneRozetka.Application.ProductAttributes.DTOs.Admin;

public record AdminAttributeOptionDto(int Id, string Value);

public record AdminAttributeDetailsDto(
    int Id,
    string Name,
    string? Slug,
    AttributeDataType DataType,
    string? Unit,
    IReadOnlyList<AdminAttributeOptionDto> Options
);
