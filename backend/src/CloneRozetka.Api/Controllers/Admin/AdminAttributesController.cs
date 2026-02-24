using CloneRozetka.Application.ProductAttributes;
using CloneRozetka.Application.ProductAttributes.DTOs.Admin;
using CloneRozetka.Application.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/attributes")]
[Authorize(Roles = "Admin")]
public class AdminAttributesController : ControllerBase
{
    private readonly IAdminAttributesService _service;

    public AdminAttributesController(IAdminAttributesService service)
    {
        _service = service;
    }

    /// <summary>GET /api/admin/attributes — paged list of attributes (Admin only).</summary>
    [HttpGet]
    public async Task<ActionResult<SearchResult<AdminAttributeListItemDto>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var result = await _service.ListAttributesPagedAsync(page, pageSize, search, ct);
        return Ok(result);
    }

    /// <summary>GET /api/admin/attributes/{id} — attribute details with options (Admin only).</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AdminAttributeDetailsDto>> GetById(int id, CancellationToken ct = default)
    {
        var item = await _service.GetAttributeByIdAsync(id, ct);
        if (item is null)
            return NotFound();
        return Ok(item);
    }

    /// <summary>POST /api/admin/attributes — create attribute (Admin only). For DataType=Enum pass Options.</summary>
    [HttpPost]
    public async Task<ActionResult<int>> Create([FromBody] AdminAttributeCreateRequest request, CancellationToken ct = default)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Name is required.");
        var id = await _service.CreateAttributeAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    /// <summary>PUT /api/admin/attributes/{id} — update attribute (Admin only). Options: Id=null create, Id set update, omit to delete.</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] AdminAttributeUpdateRequest request, CancellationToken ct = default)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Name is required.");
        try
        {
            await _service.UpdateAttributeAsync(id, request, ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    /// <summary>DELETE /api/admin/attributes/{id} — delete attribute (Admin only). Removes from categories and product values.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct = default)
    {
        try
        {
            await _service.DeleteAttributeAsync(id, ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
