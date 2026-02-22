using CloneRozetka.Application.Cart;
using CloneRozetka.Application.Cart.DTOs;
using CloneRozetka.Application.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/carts")]
[Authorize(Roles = "Admin")]
public class AdminCartsController : ControllerBase
{
    private readonly ICartService _cartService;

    public AdminCartsController(ICartService cartService)
    {
        _cartService = cartService;
    }

    /// <summary>GET /api/admin/carts — paged list of user carts. dateFilter: today, week, month, all.</summary>
    [HttpGet]
    public async Task<ActionResult<SearchResult<AdminCartListItemDto>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? dateFilter = null,
        CancellationToken ct = default)
    {
        var result = await _cartService.GetAdminCartsPagedAsync(page, pageSize, dateFilter, ct);
        return Ok(result);
    }

    /// <summary>GET /api/admin/carts/{userId} — cart details for a specific user (Admin only).</summary>
    [HttpGet("{userId:int}")]
    public async Task<ActionResult<CartDto>> GetByUserId(int userId, CancellationToken ct = default)
    {
        var cart = await _cartService.GetAdminCartByUserIdAsync(userId, ct);
        if (cart == null)
            return NotFound();
        return Ok(cart);
    }
}
