using CloneRozetka.Application.Compare.DTOs;

namespace CloneRozetka.Application.Compare;

public interface ICompareService
{
    Task<IReadOnlyList<CompareProductDto>> GetCompareAsync(int userId, CancellationToken ct = default);
    Task<bool> AddAsync(int userId, long productId, CancellationToken ct = default);
    Task<bool> RemoveAsync(int userId, long productId, CancellationToken ct = default);
    Task ClearAsync(int userId, CancellationToken ct = default);
    Task<bool> IsInCompareAsync(int userId, long productId, CancellationToken ct = default);
    Task<IReadOnlyList<long>> GetCompareProductIdsAsync(int userId, CancellationToken ct = default);
}
