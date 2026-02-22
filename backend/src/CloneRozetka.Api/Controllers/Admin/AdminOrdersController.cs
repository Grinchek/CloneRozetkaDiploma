using CloneRozetka.Application.Orders;
using CloneRozetka.Application.Orders.DTOs;
using CloneRozetka.Application.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public class AdminOrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public AdminOrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    /// <summary>GET /api/admin/orders — paged list of all orders (Admin only). dateFilter: today, week, month, all.</summary>
    [HttpGet]
    public async Task<ActionResult<SearchResult<OrderListItemDto>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? dateFilter = null,
        CancellationToken ct = default)
    {
        var result = await _orderService.GetAdminOrdersPagedAsync(page, pageSize, dateFilter, ct);
        return Ok(result);
    }

    /// <summary>GET /api/admin/orders/{id} — order details (Admin only).</summary>
    [HttpGet("{id:long}")]
    public async Task<ActionResult<OrderDetailsDto>> GetById(long id, CancellationToken ct = default)
    {
        var order = await _orderService.GetAdminOrderDetailsAsync(id, ct);
        if (order == null)
            return NotFound();
        return Ok(order);
    }
}
