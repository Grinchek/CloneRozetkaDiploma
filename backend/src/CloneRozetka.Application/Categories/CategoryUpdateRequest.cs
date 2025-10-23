using Microsoft.AspNetCore.Http;

namespace CloneRozetka.Application.Categories;

public record CategoryUpdateRequest(int Id, string Name, IFormFile? Image);
