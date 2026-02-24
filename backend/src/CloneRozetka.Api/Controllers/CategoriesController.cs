using CloneRozetka.Application.Categories.DTOs;
using CloneRozetka.Application.Categories.Interfaces;
using CloneRozetka.Application.ProductAttributes;
using CloneRozetka.Application.ProductAttributes.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController(
    ICategoryService service,
    ICategoryAttributesService categoryAttributesService,
    IValidator<CategoryCreateRequest> vCreate,
    IValidator<CategoryUpdateRequest> vUpdate) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> List() =>
        Ok(await service.ListAsync());
    [HttpGet("paged")]
    public async Task<ActionResult<PagedResponse<CategoryDto>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] bool? isDeleted = null)
    {
        return Ok(await service.ListPagedAsync(page, pageSize, search, isDeleted));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> Get(int id)
    {
        var item = await service.GetAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpGet("{id:int}/attributes")]
    public async Task<ActionResult<IReadOnlyList<CategoryAttributeItemDto>>> GetAttributes(int id, CancellationToken ct = default)
    {
        try
        {
            var list = await categoryAttributesService.GetAttributesForCategoryAsync(id, ct);
            return Ok(list);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create([FromForm] CategoryCreateRequest req)
    {
        var val = await vCreate.ValidateAsync(req);
        if (!val.IsValid)
            return ValidationProblem(new ValidationProblemDetails(val.ToDictionary()));
        var id = await service.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id }, id);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromForm] CategoryUpdateRequest req)
    {
        var val = await vUpdate.ValidateAsync(req);
        if (!val.IsValid)
            return ValidationProblem(new ValidationProblemDetails(val.ToDictionary()));
        await service.UpdateAsync(req);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("{id:int}/restore")]
    public async Task<IActionResult> Restore(int id)
    {
        await service.RestoreAsync(id);
        return NoContent();
    }
}
