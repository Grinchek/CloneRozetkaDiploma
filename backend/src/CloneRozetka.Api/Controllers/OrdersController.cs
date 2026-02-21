using System.Security.Claims;
using CloneRozetka.Application.Orders;
using CloneRozetka.Application.Orders.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.Api.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IValidator<CreateOrderRequest> _validator;

    public OrdersController(IOrderService orderService, IValidator<CreateOrderRequest> validator)
    {
        _orderService = orderService;
        _validator = validator;
    }

    private int? GetUserId()
    {
        var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(id, out var userId) ? userId : null;
    }

    [HttpPost]
    public async Task<ActionResult<CreateOrderResponse>> Create([FromBody] CreateOrderRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var validation = await _validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return BadRequest(new { errors = validation.Errors.Select(e => e.ErrorMessage) });

        try
        {
            var result = await _orderService.CreateOrderAsync(userId.Value, request, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { errors = new[] { ex.Message } });
        }
    }

    [HttpGet("my")]
    public async Task<ActionResult<IReadOnlyList<OrderListItemDto>>> GetMyOrders(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var list = await _orderService.GetMyOrdersAsync(userId.Value, ct);
        return Ok(list);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<OrderDetailsDto>> GetById(long id, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var order = await _orderService.GetOrderDetailsAsync(userId.Value, id, ct);
        if (order == null)
            return NotFound();

        return Ok(order);
    }
}
