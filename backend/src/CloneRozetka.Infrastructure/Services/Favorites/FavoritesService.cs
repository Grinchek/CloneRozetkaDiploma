using CloneRozetka.Application.Favorites;
using CloneRozetka.Application.Favorites.DTOs;
using CloneRozetka.Domain.Entities;
using CloneRozetka.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CloneRozetka.Infrastructure.Services.Favorites;

public class FavoritesService : IFavoritesService
{
    private readonly AppDbContext _db;

    public FavoritesService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<FavoriteProductDto>> GetFavoritesAsync(int userId, CancellationToken ct = default)
    {
        return await _db.Favorites
            .AsNoTracking()
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .Join(_db.Products.Where(p => !p.IsDeleted),
                f => f.ProductId,
                p => p.Id,
                (_, p) => p)
            .Select(p => new FavoriteProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Slug = p.Slug,
                Price = p.Price,
                CategoryId = p.CategoryId,
                MainImageUrl = _db.ProductImages
                    .Where(i => i.ProductId == p.Id)
                    .OrderBy(i => i.Priority)
                    .Select(i => i.Name)
                    .FirstOrDefault()
            })
            .ToListAsync(ct);
    }

    public async Task<bool> AddAsync(int userId, long productId, CancellationToken ct = default)
    {
        var exists = await _db.Favorites.AnyAsync(f => f.UserId == userId && f.ProductId == productId, ct);
        if (exists)
            return true;

        var productExists = await _db.Products.AnyAsync(p => p.Id == productId && !p.IsDeleted, ct);
        if (!productExists)
            return false;

        _db.Favorites.Add(new FavoriteEntity
        {
            UserId = userId,
            ProductId = productId
        });
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> RemoveAsync(int userId, long productId, CancellationToken ct = default)
    {
        var item = await _db.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.ProductId == productId, ct);
        if (item == null)
            return false;

        _db.Favorites.Remove(item);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> IsInFavoritesAsync(int userId, long productId, CancellationToken ct = default)
    {
        return await _db.Favorites.AnyAsync(f => f.UserId == userId && f.ProductId == productId, ct);
    }

    public async Task<IReadOnlyList<long>> GetFavoriteProductIdsAsync(int userId, CancellationToken ct = default)
    {
        return await _db.Favorites
            .AsNoTracking()
            .Where(f => f.UserId == userId)
            .Select(f => f.ProductId)
            .ToListAsync(ct);
    }
}
