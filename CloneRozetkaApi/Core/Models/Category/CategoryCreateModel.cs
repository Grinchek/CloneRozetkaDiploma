using Microsoft.AspNetCore.Http;

namespace Core.Models.Category;

public class CategoryCreateModel
{
    public string Name { get; set; } = string.Empty;
    public IFormFile Image { get; set; }
}