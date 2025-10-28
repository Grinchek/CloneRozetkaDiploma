using CloneRozetka.Application.Abstractions;
using CloneRozetka.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CloneRozetka.Infrastructure.Repositories;

public class EfRepository<T>(AppDbContext db) : IRepository<T> where T : class
{
    public IQueryable<T> Query(bool asNoTracking = false) =>
        asNoTracking ? db.Set<T>().AsNoTracking() : db.Set<T>();

    public Task<T?> GetByIdAsync(int id, CancellationToken ct = default) =>
        db.Set<T>().FindAsync([id], ct).AsTask();

    public async Task<IReadOnlyList<T>> ListAsync(
        System.Linq.Expressions.Expression<Func<T, bool>>? predicate = null,
        CancellationToken ct = default)
    {
        var q = db.Set<T>().AsQueryable();
        if (predicate is not null) q = q.Where(predicate);
        return await q.ToListAsync(ct);
    }

    public async Task<T> AddAsync(T entity, CancellationToken ct = default)
    {
        await db.Set<T>().AddAsync(entity, ct);
        await db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task UpdateAsync(T entity, CancellationToken ct = default)
    {
        db.Set<T>().Update(entity);
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(T entity, CancellationToken ct = default)
    {
        db.Set<T>().Remove(entity);
        await db.SaveChangesAsync(ct);
    }

    public Task<List<TOut>> ToListAsync<TOut>(IQueryable<TOut> query, CancellationToken ct = default) =>
        EntityFrameworkQueryableExtensions.ToListAsync(query, ct);

    public Task<TOut?> FirstOrDefaultAsync<TOut>(IQueryable<TOut> query, CancellationToken ct = default) =>
        EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(query, ct);
    public async Task<bool> ExistsAsync(IQueryable<T> query, CancellationToken ct = default)
        => await EntityFrameworkQueryableExtensions.AnyAsync(query, ct);
}
