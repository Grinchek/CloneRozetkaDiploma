using CloneRozetka.Application.Cart.DTOs;

namespace CloneRozetka.Application.Cart;

public interface ICartService
{
    Task<CartDto> GetCartAsync(int userId, CancellationToken ct = default);
    Task<CartDto> AddItemAsync(int userId, long productId, int quantity, CancellationToken ct = default);
    Task<CartDto?> UpdateQuantityAsync(int userId, long productId, int quantity, CancellationToken ct = default);
    Task<CartDto> RemoveItemAsync(int userId, long productId, CancellationToken ct = default);
    Task ClearCartAsync(int userId, CancellationToken ct = default);
}
