namespace CloneRozetka.Application.Favorites.DTOs;

public class FavoriteProductDto
{
    public long Id { get; set; }
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public string? MainImageUrl { get; set; }
}
