using System.Linq.Expressions;

namespace CloneRozetka.Application.Abstractions;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id, CancellationToken ct = default);

    Task<IReadOnlyList<T>> ListAsync(
        Expression<Func<T, bool>>? predicate = null,
        CancellationToken ct = default);

    Task<T> AddAsync(T entity, CancellationToken ct = default);
    Task UpdateAsync(T entity, CancellationToken ct = default);
    Task DeleteAsync(T entity, CancellationToken ct = default);

    // NEW: можливість будувати запити без EF у Application
    IQueryable<T> Query(bool asNoTracking = false);

    // NEW: матеріалізація переноситься в репозиторій (Infrastructure)
    Task<List<TOut>> ToListAsync<TOut>(IQueryable<TOut> query, CancellationToken ct = default);
    Task<TOut?> FirstOrDefaultAsync<TOut>(IQueryable<TOut> query, CancellationToken ct = default);
    Task<bool> ExistsAsync(IQueryable<T> query, CancellationToken ct = default);
}
