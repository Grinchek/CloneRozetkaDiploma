namespace CloneRozetka.Application.Cart.DTOs;

public class AddCartItemRequest
{
    public long ProductId { get; set; }
    public int Quantity { get; set; }
}
