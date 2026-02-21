using CloneRozetka.Application.Orders.DTOs;

namespace CloneRozetka.Application.Orders;

public interface IOrderService
{
    Task<CreateOrderResponse> CreateOrderAsync(int userId, CreateOrderRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<OrderListItemDto>> GetMyOrdersAsync(int userId, CancellationToken ct = default);
    Task<OrderDetailsDto?> GetOrderDetailsAsync(int userId, long orderId, CancellationToken ct = default);
}
