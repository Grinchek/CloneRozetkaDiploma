using System.Security.Claims;
using CloneRozetka.Application.Favorites;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.Api.Controllers;

[ApiController]
[Route("api/favorites")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly IFavoritesService _favoritesService;

    public FavoritesController(IFavoritesService favoritesService)
    {
        _favoritesService = favoritesService;
    }

    private int? GetUserId()
    {
        var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(id, out var userId) ? userId : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetFavorites(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var list = await _favoritesService.GetFavoritesAsync(userId.Value, ct);
        return Ok(list);
    }

    [HttpGet("ids")]
    public async Task<IActionResult> GetFavoriteIds(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var ids = await _favoritesService.GetFavoriteProductIdsAsync(userId.Value, ct);
        return Ok(ids);
    }

    [HttpPost("{productId:long}")]
    public async Task<IActionResult> Add(long productId, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var added = await _favoritesService.AddAsync(userId.Value, productId, ct);
        if (!added)
            return NotFound(new { errors = new[] { "Product not found." } });
        return Ok(new { added = true });
    }

    [HttpDelete("{productId:long}")]
    public async Task<IActionResult> Remove(long productId, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var removed = await _favoritesService.RemoveAsync(userId.Value, productId, ct);
        return Ok(new { removed });
    }
}
