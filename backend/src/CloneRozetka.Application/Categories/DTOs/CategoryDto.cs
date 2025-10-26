namespace CloneRozetka.Application.Categories.DTOs;

public record CategoryDto(
    int Id,
    string Name,
    int Priority,
    string UrlSlug,
    int? ParentId,
    string? Image
);
