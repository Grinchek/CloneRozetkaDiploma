using Microsoft.AspNetCore.Http;

namespace CloneRozetka.Application.Categories.DTOs;

public record CategoryCreateRequest(string Name, IFormFile Image);
