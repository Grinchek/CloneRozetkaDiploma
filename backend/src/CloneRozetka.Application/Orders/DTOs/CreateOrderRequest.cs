namespace CloneRozetka.Application.Orders.DTOs;

public class CreateOrderRequest
{
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientPhone { get; set; } = string.Empty;
    public string NpCityRef { get; set; } = string.Empty;
    public string NpCityName { get; set; } = string.Empty;
    public string NpWarehouseRef { get; set; } = string.Empty;
    public string NpWarehouseName { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}

public class CreateOrderItemRequest
{
    public long ProductId { get; set; }
    public int Quantity { get; set; }
}
