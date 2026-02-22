namespace CloneRozetka.Application.Cart.DTOs;

/// <summary>
/// Admin list item: one row per user that has at least one cart item.
/// </summary>
public class AdminCartListItemDto
{
    public int UserId { get; set; }
    public string? UserEmail { get; set; }
    public string? UserName { get; set; }
    public int TotalQuantity { get; set; }
    public decimal TotalPrice { get; set; }
    public int ItemsCount { get; set; }
    public DateTime? LastUpdatedAt { get; set; }
}
