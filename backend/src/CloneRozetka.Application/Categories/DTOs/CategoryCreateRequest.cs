using Microsoft.AspNetCore.Http;

namespace CloneRozetka.Application.Categories.DTOs;

public record CategoryCreateRequest(
    string Name,
    int Priority,
    string UrlSlug,
    int? ParentId,
    IFormFile? Image
);
