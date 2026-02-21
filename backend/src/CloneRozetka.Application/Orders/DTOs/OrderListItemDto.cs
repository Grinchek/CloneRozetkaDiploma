namespace CloneRozetka.Application.Orders.DTOs;

public class OrderListItemDto
{
    public long Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public string NpCityName { get; set; } = string.Empty;
    public string NpWarehouseName { get; set; } = string.Empty;
}
