using Microsoft.AspNetCore.Http;

namespace CloneRozetka.Application.Products.DTOs
{
    public class ProductCreateRequest
    {
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public int CategoryId { get; set; }

        public List<IFormFile>? Images { get; set; }
    }
}
