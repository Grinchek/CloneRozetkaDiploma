using CloneRozetka.Application.Cart;
using CloneRozetka.Application.Cart.DTOs;
using CloneRozetka.Application.Search;
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

    public async Task<SearchResult<AdminCartListItemDto>> GetAdminCartsPagedAsync(int page, int pageSize, string? dateFilter = null, CancellationToken ct = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 10 : pageSize;

        var grouped = from c in _db.CartItems.AsNoTracking()
                      join p in _db.Products on c.ProductId equals p.Id
                      where !p.IsDeleted
                      group new { c, p } by c.UserId into g
                      select new
                      {
                          UserId = g.Key,
                          TotalQuantity = g.Sum(x => x.c.Quantity),
                          TotalPrice = g.Sum(x => x.p.Price * x.c.Quantity),
                          ItemsCount = g.Count(),
                          LastUpdatedAt = g.Max(x => x.c.UpdatedAt)
                      };

        var utcNow = DateTime.UtcNow;
        var filter = (dateFilter ?? "").Trim();
        if (string.Equals(filter, "today", StringComparison.OrdinalIgnoreCase))
        {
            var startOfToday = new DateTime(utcNow.Year, utcNow.Month, utcNow.Day, 0, 0, 0, DateTimeKind.Utc);
            grouped = grouped.Where(g => g.LastUpdatedAt >= startOfToday && g.LastUpdatedAt < startOfToday.AddDays(1));
        }
        else if (string.Equals(filter, "week", StringComparison.OrdinalIgnoreCase))
        {
            var weekAgo = utcNow.AddDays(-7);
            grouped = grouped.Where(g => g.LastUpdatedAt >= weekAgo);
        }
        else if (string.Equals(filter, "month", StringComparison.OrdinalIgnoreCase))
        {
            var monthAgo = utcNow.AddDays(-30);
            grouped = grouped.Where(g => g.LastUpdatedAt >= monthAgo);
        }

        var totalCount = await grouped.CountAsync(ct);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var withUsers = from g in grouped
                        join u in _db.Users on g.UserId equals u.Id
                        orderby g.LastUpdatedAt descending
                        select new AdminCartListItemDto
                        {
                            UserId = g.UserId,
                            UserEmail = u.Email,
                            UserName = u.FullName ?? u.UserName,
                            TotalQuantity = g.TotalQuantity,
                            TotalPrice = g.TotalPrice,
                            ItemsCount = g.ItemsCount,
                            LastUpdatedAt = g.LastUpdatedAt
                        };

        var items = await withUsers
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new SearchResult<AdminCartListItemDto>
        {
            Items = items,
            Pagination = new PaginationModel
            {
                TotalCount = totalCount,
                TotalPages = totalPages,
                ItemsPerPage = pageSize,
                CurrentPage = page
            }
        };
    }

    public async Task<CartDto?> GetAdminCartByUserIdAsync(int userId, CancellationToken ct = default)
    {
        var hasAny = await _db.CartItems.AnyAsync(c => c.UserId == userId, ct);
        if (!hasAny)
            return null;
        return await GetCartAsync(userId, ct);
    }
}
