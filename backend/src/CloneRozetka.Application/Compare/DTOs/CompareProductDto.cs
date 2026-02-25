namespace CloneRozetka.Application.Compare.DTOs;

public class CompareProductDto
{
    public long Id { get; set; }
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public string? MainImageUrl { get; set; }
    public IReadOnlyList<CompareSpecItemDto> Specifications { get; set; } = new List<CompareSpecItemDto>();
}
