namespace CloneRozetka.Application.Orders.DTOs;

/// <summary>
/// Order is created from the server-side cart (DB). Items are not sent from the client.
/// </summary>
public class CreateOrderRequest
{
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientPhone { get; set; } = string.Empty;
    public string NpCityRef { get; set; } = string.Empty;
    public string NpCityName { get; set; } = string.Empty;
    public string NpWarehouseRef { get; set; } = string.Empty;
    public string NpWarehouseName { get; set; } = string.Empty;
    public string? Comment { get; set; }
}
