using CloneRozetka.Application.Favorites.DTOs;

namespace CloneRozetka.Application.Favorites;

public interface IFavoritesService
{
    Task<IReadOnlyList<FavoriteProductDto>> GetFavoritesAsync(int userId, CancellationToken ct = default);
    Task<bool> AddAsync(int userId, long productId, CancellationToken ct = default);
    Task<bool> RemoveAsync(int userId, long productId, CancellationToken ct = default);
    Task<bool> IsInFavoritesAsync(int userId, long productId, CancellationToken ct = default);
    Task<IReadOnlyList<long>> GetFavoriteProductIdsAsync(int userId, CancellationToken ct = default);
}
