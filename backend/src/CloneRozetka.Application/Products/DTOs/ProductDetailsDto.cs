namespace CloneRozetka.Application.Products.DTOs
{
    public class ProductDetailsDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public int CategoryId { get; set; }

        public List<string> ImageUrls { get; set; } = new();
    }
}
