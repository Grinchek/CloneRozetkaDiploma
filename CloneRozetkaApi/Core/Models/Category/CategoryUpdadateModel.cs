using Microsoft.AspNetCore.Http;

namespace Core.Models.Category;

public class CategoryUpdateModel
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public IFormFile? Image { get; set; }
}