namespace CloneRozetka.Application.Orders.DTOs;

public class CreateOrderResponse
{
    public long OrderId { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal TotalPrice { get; set; }
}
