using Microsoft.AspNetCore.Http;

namespace CloneRozetka.Application.Categories.DTOs;

public record CategoryUpdateRequest(int Id, string Name, IFormFile? Image);
