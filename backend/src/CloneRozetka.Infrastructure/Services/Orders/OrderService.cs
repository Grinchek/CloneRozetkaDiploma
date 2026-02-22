using CloneRozetka.Application.Orders;
using CloneRozetka.Application.Orders.DTOs;
using CloneRozetka.Application.Search;
using CloneRozetka.Domain.Entities;
using CloneRozetka.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CloneRozetka.Infrastructure.Services.Orders;

public class OrderService : IOrderService
{
    private readonly AppDbContext _db;

    public OrderService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CreateOrderResponse> CreateOrderAsync(int userId, CreateOrderRequest request, CancellationToken ct = default)
    {
        var cartItems = await _db.CartItems
            .Where(c => c.UserId == userId)
            .ToListAsync(ct);
        if (cartItems.Count == 0)
            throw new InvalidOperationException("Cart is empty.");

        var productIds = cartItems.Select(x => x.ProductId).Distinct().ToList();
        var products = await _db.Products
            .AsNoTracking()
            .Where(p => productIds.Contains(p.Id) && !p.IsDeleted)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Price,
                MainImageName = _db.ProductImages
                    .Where(i => i.ProductId == p.Id)
                    .OrderBy(i => i.Priority)
                    .Select(i => i.Name)
                    .FirstOrDefault()
            })
            .ToDictionaryAsync(x => x.Id, ct);

        var order = new OrderEntity
        {
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            Status = "Created",
            DeliveryProvider = "NovaPoshta",
            RecipientName = request.RecipientName.Trim(),
            RecipientPhone = request.RecipientPhone.Trim(),
            NpCityRef = request.NpCityRef.Trim(),
            NpCityName = request.NpCityName.Trim(),
            NpWarehouseRef = request.NpWarehouseRef.Trim(),
            NpWarehouseName = request.NpWarehouseName.Trim(),
            Comment = string.IsNullOrWhiteSpace(request.Comment) ? null : request.Comment.Trim()
        };

        decimal totalPrice = 0;
        foreach (var cartItem in cartItems)
        {
            if (cartItem.Quantity < 1)
                continue;
            if (!products.TryGetValue(cartItem.ProductId, out var product))
                throw new InvalidOperationException($"Product {cartItem.ProductId} not found or unavailable.");
            var price = product.Price;
            var lineTotal = price * cartItem.Quantity;
            totalPrice += lineTotal;
            order.Items.Add(new OrderItemEntity
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Price = price,
                Quantity = cartItem.Quantity,
                ImageUrl = product.MainImageName,
                LineTotal = lineTotal
            });
        }

        if (order.Items.Count == 0)
            throw new InvalidOperationException("No valid items in cart.");

        order.TotalPrice = totalPrice;

        using var transaction = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            _db.Orders.Add(order);
            _db.CartItems.RemoveRange(cartItems);
            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }

        return new CreateOrderResponse
        {
            OrderId = order.Id,
            CreatedAt = order.CreatedAt,
            TotalPrice = order.TotalPrice
        };
    }

    public async Task<IReadOnlyList<OrderListItemDto>> GetMyOrdersAsync(int userId, CancellationToken ct = default)
    {
        return await _db.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderListItemDto
            {
                Id = o.Id,
                CreatedAt = o.CreatedAt,
                Status = o.Status,
                TotalPrice = o.TotalPrice,
                NpCityName = o.NpCityName,
                NpWarehouseName = o.NpWarehouseName
            })
            .ToListAsync(ct);
    }

    public async Task<OrderDetailsDto?> GetOrderDetailsAsync(int userId, long orderId, CancellationToken ct = default)
    {
        var order = await _db.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId, ct);
        if (order == null)
            return null;

        return new OrderDetailsDto
        {
            Id = order.Id,
            CreatedAt = order.CreatedAt,
            Status = order.Status,
            TotalPrice = order.TotalPrice,
            RecipientName = order.RecipientName,
            RecipientPhone = order.RecipientPhone,
            NpCityName = order.NpCityName,
            NpWarehouseName = order.NpWarehouseName,
            Comment = order.Comment,
            Items = order.Items.Select(i => new OrderItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Price = i.Price,
                Quantity = i.Quantity,
                ImageUrl = i.ImageUrl,
                LineTotal = i.LineTotal
            }).ToList()
        };
    }

    public async Task<SearchResult<OrderListItemDto>> GetAdminOrdersPagedAsync(int page, int pageSize, string? dateFilter = null, CancellationToken ct = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 10 : pageSize;

        var query = _db.Orders.AsNoTracking();

        var utcNow = DateTime.UtcNow;
        var filter = (dateFilter ?? "").Trim();
        if (string.Equals(filter, "today", StringComparison.OrdinalIgnoreCase))
        {
            var startOfToday = new DateTime(utcNow.Year, utcNow.Month, utcNow.Day, 0, 0, 0, DateTimeKind.Utc);
            query = query.Where(o => o.CreatedAt >= startOfToday && o.CreatedAt < startOfToday.AddDays(1));
        }
        else if (string.Equals(filter, "week", StringComparison.OrdinalIgnoreCase))
        {
            var weekAgo = utcNow.AddDays(-7);
            query = query.Where(o => o.CreatedAt >= weekAgo);
        }
        else if (string.Equals(filter, "month", StringComparison.OrdinalIgnoreCase))
        {
            var monthAgo = utcNow.AddDays(-30);
            query = query.Where(o => o.CreatedAt >= monthAgo);
        }
        // "all" or empty: no date filter

        var totalCount = await query.CountAsync(ct);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new OrderListItemDto
            {
                Id = o.Id,
                CreatedAt = o.CreatedAt,
                Status = o.Status,
                TotalPrice = o.TotalPrice,
                NpCityName = o.NpCityName,
                NpWarehouseName = o.NpWarehouseName
            })
            .ToListAsync(ct);

        return new SearchResult<OrderListItemDto>
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

    public async Task<OrderDetailsDto?> GetAdminOrderDetailsAsync(long orderId, CancellationToken ct = default)
    {
        var order = await _db.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);
        if (order == null)
            return null;

        return new OrderDetailsDto
        {
            Id = order.Id,
            CreatedAt = order.CreatedAt,
            Status = order.Status,
            TotalPrice = order.TotalPrice,
            RecipientName = order.RecipientName,
            RecipientPhone = order.RecipientPhone,
            NpCityName = order.NpCityName,
            NpWarehouseName = order.NpWarehouseName,
            Comment = order.Comment,
            Items = order.Items.Select(i => new OrderItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Price = i.Price,
                Quantity = i.Quantity,
                ImageUrl = i.ImageUrl,
                LineTotal = i.LineTotal
            }).ToList()
        };
    }
}
