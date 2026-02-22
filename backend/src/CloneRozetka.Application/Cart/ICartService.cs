using CloneRozetka.Application.Cart.DTOs;
using CloneRozetka.Application.Search;

namespace CloneRozetka.Application.Cart;

public interface ICartService
{
    Task<CartDto> GetCartAsync(int userId, CancellationToken ct = default);
    Task<CartDto> AddItemAsync(int userId, long productId, int quantity, CancellationToken ct = default);
    Task<CartDto?> UpdateQuantityAsync(int userId, long productId, int quantity, CancellationToken ct = default);
    Task<CartDto> RemoveItemAsync(int userId, long productId, CancellationToken ct = default);
    Task ClearCartAsync(int userId, CancellationToken ct = default);

    /// <summary>Admin: paged list of user carts. dateFilter: Today, Week, Month, or null/empty for All (by LastUpdatedAt).</summary>
    Task<SearchResult<AdminCartListItemDto>> GetAdminCartsPagedAsync(int page, int pageSize, string? dateFilter = null, CancellationToken ct = default);

    /// <summary>Admin: cart details for a specific user by id.</summary>
    Task<CartDto?> GetAdminCartByUserIdAsync(int userId, CancellationToken ct = default);
}
