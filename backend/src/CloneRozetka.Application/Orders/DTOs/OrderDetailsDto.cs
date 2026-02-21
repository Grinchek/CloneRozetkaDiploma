namespace CloneRozetka.Application.Orders.DTOs;

public class OrderDetailsDto
{
    public long Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientPhone { get; set; } = string.Empty;
    public string NpCityName { get; set; } = string.Empty;
    public string NpWarehouseName { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public long ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string? ImageUrl { get; set; }
    public decimal LineTotal { get; set; }
}
