using System.Security.Claims;
using CloneRozetka.Application.Compare;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.Api.Controllers;

[ApiController]
[Route("api/compare")]
[Authorize]
public class CompareController : ControllerBase
{
    private readonly ICompareService _compareService;

    public CompareController(ICompareService compareService)
    {
        _compareService = compareService;
    }

    private int? GetUserId()
    {
        var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(id, out var userId) ? userId : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetCompare(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var list = await _compareService.GetCompareAsync(userId.Value, ct);
        return Ok(list);
    }

    [HttpGet("ids")]
    public async Task<IActionResult> GetCompareIds(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var ids = await _compareService.GetCompareProductIdsAsync(userId.Value, ct);
        return Ok(ids);
    }

    [HttpPost("{productId:long}")]
    public async Task<IActionResult> Add(long productId, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var added = await _compareService.AddAsync(userId.Value, productId, ct);
        if (!added)
            return BadRequest(new { errors = new[] { "Не вдалося додати. Перевірте, чи товар існує і чи не перевищено ліміт (4 товари)." } });
        return Ok(new { added = true });
    }

    [HttpDelete("{productId:long}")]
    public async Task<IActionResult> Remove(long productId, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var removed = await _compareService.RemoveAsync(userId.Value, productId, ct);
        return Ok(new { removed });
    }

    [HttpDelete]
    public async Task<IActionResult> Clear(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        await _compareService.ClearAsync(userId.Value, ct);
        return Ok(new { cleared = true });
    }
}
