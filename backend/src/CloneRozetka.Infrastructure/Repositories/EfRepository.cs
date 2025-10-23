using CloneRozetka.Application.Abstractions;
using CloneRozetka.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace CloneRozetka.Infrastructure.Repositories;

public class EfRepository<T>(AppDbContext db) : IRepository<T> where T : class
{
    public async Task<T?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await db.Set<T>().FindAsync([id], ct);

    public async Task<IReadOnlyList<T>> ListAsync(Expression<Func<T, bool>>? p = null, CancellationToken ct = default) =>
        p is null
            ? await db.Set<T>().AsNoTracking().ToListAsync(ct)
            : await db.Set<T>().AsNoTracking().Where(p).ToListAsync(ct);

    public async Task<T> AddAsync(T e, CancellationToken ct = default)
    {
        await db.Set<T>().AddAsync(e, ct);
        await db.SaveChangesAsync(ct);
        return e;
    }

    public async Task UpdateAsync(T e, CancellationToken ct = default)
    {
        db.Set<T>().Update(e);
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(T e, CancellationToken ct = default)
    {
        db.Set<T>().Remove(e);
        await db.SaveChangesAsync(ct);
    }

    public IQueryable<T> Query() => db.Set<T>().AsQueryable();
}
