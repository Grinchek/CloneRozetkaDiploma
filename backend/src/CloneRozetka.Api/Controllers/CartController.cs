using System.Security.Claims;
using CloneRozetka.Application.Cart;
using CloneRozetka.Application.Cart.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.Api.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private int? GetUserId()
    {
        var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(id, out var userId) ? userId : null;
    }

    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCart(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var cart = await _cartService.GetCartAsync(userId.Value, ct);
        return Ok(cart);
    }

    [HttpPost("items")]
    public async Task<ActionResult<CartDto>> AddItem([FromBody] AddCartItemRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        if (request.Quantity <= 0)
            return BadRequest(new { errors = new[] { "Quantity must be greater than 0." } });

        try
        {
            var cart = await _cartService.AddItemAsync(userId.Value, request.ProductId, request.Quantity, ct);
            return Ok(cart);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { errors = new[] { "Product not found." } });
        }
    }

    [HttpPut("items/{productId:long}")]
    public async Task<ActionResult<CartDto>> UpdateQuantity(long productId, [FromBody] UpdateCartItemRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        if (request.Quantity < 0)
            return BadRequest(new { errors = new[] { "Quantity cannot be negative." } });

        var cart = await _cartService.UpdateQuantityAsync(userId.Value, productId, request.Quantity, ct);
        if (cart == null)
            return NotFound(new { errors = new[] { "Cart item not found." } });
        return Ok(cart);
    }

    [HttpDelete("items/{productId:long}")]
    public async Task<ActionResult<CartDto>> RemoveItem(long productId, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var cart = await _cartService.RemoveItemAsync(userId.Value, productId, ct);
        return Ok(cart);
    }

    [HttpDelete("clear")]
    public async Task<ActionResult<CartDto>> Clear(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        await _cartService.ClearCartAsync(userId.Value, ct);
        var cart = await _cartService.GetCartAsync(userId.Value, ct);
        return Ok(cart);
    }
}
