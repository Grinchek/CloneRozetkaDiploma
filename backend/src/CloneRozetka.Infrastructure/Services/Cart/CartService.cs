using CloneRozetka.Application.Cart;
using CloneRozetka.Application.Cart.DTOs;
using CloneRozetka.Domain.Entities;
using CloneRozetka.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CloneRozetka.Infrastructure.Services.Cart;

public class CartService : ICartService
{
    private readonly AppDbContext _db;

    public CartService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CartDto> GetCartAsync(int userId, CancellationToken ct = default)
    {
        var items = await _db.CartItems
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .Join(_db.Products.Where(p => !p.IsDeleted),
                c => c.ProductId,
                p => p.Id,
                (c, p) => new { c, p })
            .Select(x => new
            {
                x.c.ProductId,
                x.c.Quantity,
                ProductName = x.p.Name,
                Price = x.p.Price,
                MainImageName = _db.ProductImages
                    .Where(i => i.ProductId == x.p.Id)
                    .OrderBy(i => i.Priority)
                    .Select(i => i.Name)
                    .FirstOrDefault()
            })
            .ToListAsync(ct);

        var dtos = items.Select(x => new CartItemDto
        {
            ProductId = x.ProductId,
            ProductName = x.ProductName,
            Price = x.Price,
            ImageUrl = x.MainImageName,
            Quantity = x.Quantity,
            LineTotal = x.Price * x.Quantity
        }).ToList();

        return new CartDto
        {
            Items = dtos,
            TotalQuantity = dtos.Sum(x => x.Quantity),
            TotalPrice = dtos.Sum(x => x.LineTotal)
        };
    }

    public async Task<CartDto> AddItemAsync(int userId, long productId, int quantity, CancellationToken ct = default)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than 0.", nameof(quantity));

        var productExists = await _db.Products.AnyAsync(p => p.Id == productId && !p.IsDeleted, ct);
        if (!productExists)
            throw new KeyNotFoundException($"Product {productId} not found.");

        var existing = await _db.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId, ct);

        var now = DateTime.UtcNow;
        if (existing != null)
        {
            existing.Quantity += quantity;
            existing.UpdatedAt = now;
        }
        else
        {
            _db.CartItems.Add(new CartItemEntity
            {
                UserId = userId,
                ProductId = productId,
                Quantity = quantity,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        await _db.SaveChangesAsync(ct);
        return await GetCartAsync(userId, ct);
    }

    public async Task<CartDto?> UpdateQuantityAsync(int userId, long productId, int quantity, CancellationToken ct = default)
    {
        var item = await _db.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId, ct);
        if (item == null)
            return null;

        if (quantity <= 0)
        {
            _db.CartItems.Remove(item);
            await _db.SaveChangesAsync(ct);
            return await GetCartAsync(userId, ct);
        }

        item.Quantity = quantity;
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return await GetCartAsync(userId, ct);
    }

    public async Task<CartDto> RemoveItemAsync(int userId, long productId, CancellationToken ct = default)
    {
        var item = await _db.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId, ct);
        if (item != null)
        {
            _db.CartItems.Remove(item);
            await _db.SaveChangesAsync(ct);
        }
        return await GetCartAsync(userId, ct);
    }

    public async Task ClearCartAsync(int userId, CancellationToken ct = default)
    {
        var items = await _db.CartItems.Where(c => c.UserId == userId).ToListAsync(ct);
        _db.CartItems.RemoveRange(items);
        await _db.SaveChangesAsync(ct);
    }
}
