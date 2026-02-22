using CloneRozetka.Application.Orders.DTOs;
using CloneRozetka.Application.Search;

namespace CloneRozetka.Application.Orders;

public interface IOrderService
{
    Task<CreateOrderResponse> CreateOrderAsync(int userId, CreateOrderRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<OrderListItemDto>> GetMyOrdersAsync(int userId, CancellationToken ct = default);
    Task<OrderDetailsDto?> GetOrderDetailsAsync(int userId, long orderId, CancellationToken ct = default);

    /// <summary>Admin: paged list of all orders. dateFilter: Today, Week, Month, or null/empty for All.</summary>
    Task<SearchResult<OrderListItemDto>> GetAdminOrdersPagedAsync(int page, int pageSize, string? dateFilter = null, CancellationToken ct = default);

    /// <summary>Admin: order details by id (no user filter).</summary>
    Task<OrderDetailsDto?> GetAdminOrderDetailsAsync(long orderId, CancellationToken ct = default);
}
