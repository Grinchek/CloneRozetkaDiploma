using CloneRozetka.Application.Orders;
using CloneRozetka.Application.Orders.DTOs;
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
        if (request.Items == null || request.Items.Count == 0)
            throw new InvalidOperationException("Cart is empty.");

        var productIds = request.Items.Select(x => x.ProductId).Distinct().ToList();
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
        foreach (var item in request.Items)
        {
            if (item.Quantity < 1)
                continue;
            if (!products.TryGetValue(item.ProductId, out var product))
                throw new InvalidOperationException($"Product {item.ProductId} not found or unavailable.");
            var price = product.Price;
            var lineTotal = price * item.Quantity;
            totalPrice += lineTotal;
            order.Items.Add(new OrderItemEntity
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Price = price,
                Quantity = item.Quantity,
                ImageUrl = product.MainImageName,
                LineTotal = lineTotal
            });
        }

        if (order.Items.Count == 0)
            throw new InvalidOperationException("No valid items in cart.");

        order.TotalPrice = totalPrice;
        _db.Orders.Add(order);
        await _db.SaveChangesAsync(ct);

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
}
