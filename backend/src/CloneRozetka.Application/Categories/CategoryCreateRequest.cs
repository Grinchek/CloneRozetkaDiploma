using Microsoft.AspNetCore.Http;

namespace CloneRozetka.Application.Categories;

public record CategoryCreateRequest(string Name, IFormFile Image);
