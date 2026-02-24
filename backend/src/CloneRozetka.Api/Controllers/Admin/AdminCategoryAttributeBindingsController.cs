using CloneRozetka.Application.ProductAttributes;
using CloneRozetka.Application.ProductAttributes.DTOs.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/categories")]
[Authorize(Roles = "Admin")]
public class AdminCategoryAttributeBindingsController : ControllerBase
{
    private readonly IAdminAttributesService _service;

    public AdminCategoryAttributeBindingsController(IAdminAttributesService service)
    {
        _service = service;
    }

    /// <summary>GET /api/admin/categories/{categoryId}/attribute-bindings — direct bindings + inherited from parent categories (Admin only).</summary>
    [HttpGet("{categoryId:int}/attribute-bindings")]
    public async Task<ActionResult<AdminCategoryAttributeBindingsResponse>> GetBindings(int categoryId, CancellationToken ct = default)
    {
        try
        {
            var response = await _service.GetCategoryAttributeBindingsWithInheritedAsync(categoryId, ct);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    /// <summary>PUT /api/admin/categories/{categoryId}/attribute-bindings — set attribute bindings (replaces all). (Admin only).</summary>
    [HttpPut("{categoryId:int}/attribute-bindings")]
    public async Task<IActionResult> SetBindings(int categoryId, [FromBody] AdminCategoryAttributeBindingUpdateRequest request, CancellationToken ct = default)
    {
        try
        {
            await _service.SetCategoryAttributeBindingsAsync(categoryId, request ?? new AdminCategoryAttributeBindingUpdateRequest(Array.Empty<AdminCategoryAttributeBindingUpdateItem>()), ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
