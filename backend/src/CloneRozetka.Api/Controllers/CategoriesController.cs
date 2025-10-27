using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Categories.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController(
    ICategoryService service,
    IValidator<CategoryCreateRequest> vCreate,
    IValidator<CategoryUpdateRequest> vUpdate) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> List(CancellationToken ct) =>
        Ok(await service.ListAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> Get(int id, CancellationToken ct)
    {
        var item = await service.GetAsync(id, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create([FromForm] CategoryCreateRequest req, CancellationToken ct)
    {
        var val = await vCreate.ValidateAsync(req, ct);
        if (!val.IsValid)
            return ValidationProblem(new ValidationProblemDetails(val.ToDictionary()));
        var id = await service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(Get), new { id }, id);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromForm] CategoryUpdateRequest req, CancellationToken ct)
    {
        var val = await vUpdate.ValidateAsync(req, ct);
        if (!val.IsValid)
            return ValidationProblem(new ValidationProblemDetails(val.ToDictionary()));
        await service.UpdateAsync(req, ct);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await service.DeleteAsync(id, ct);
        return NoContent();
    }
}
