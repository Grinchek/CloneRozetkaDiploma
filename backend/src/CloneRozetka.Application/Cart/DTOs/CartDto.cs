namespace CloneRozetka.Application.Cart.DTOs;

public class CartDto
{
    public List<CartItemDto> Items { get; set; } = new();
    public int TotalQuantity { get; set; }
    public decimal TotalPrice { get; set; }
}

public class CartItemDto
{
    public long ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
}
