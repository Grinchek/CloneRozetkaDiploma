using CloneRozetka.Application.Products.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController(IProductService productService) : ControllerBase
    {
        [HttpGet("list")]
        public async Task<ActionResult<IReadOnlyList<ProductListItemDto>>> GetAll(CancellationToken ct = default)
            => Ok(await productService.ListAllAsync(ct));

        [HttpGet("paged")]
        public async Task<ActionResult<SearchResult<ProductListItemDto>>> GetPaged(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] bool? isDeleted = null,
            CancellationToken ct = default)
            => Ok(await productService.ListPagedAsync(page, pageSize, search, isDeleted, ct));

        [HttpGet("{id:long}")]
        public async Task<ActionResult<ProductDetailsDto>> Get(long id, CancellationToken ct)
            => Ok(await productService.GetByIdAsync(id, ct));

        [HttpPost]
        [RequestSizeLimit(20_000_000)]
        public async Task<ActionResult> Create([FromForm] ProductCreateRequest request, CancellationToken ct)
        {
            var id = await productService.CreateAsync(request, ct);
            return CreatedAtAction(nameof(Get), new { id }, null);
        }

        [HttpPut("{id:long}")]
        [RequestSizeLimit(20_000_000)]
        public async Task<IActionResult> Update(long id, [FromForm] ProductUpdateRequest request, CancellationToken ct)
        {
            await productService.UpdateAsync(id, request, ct);
            return NoContent();
        }

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            await productService.DeleteAsync(id, ct);
            return NoContent();
        }

        [HttpPost("{id:long}/restore")]
        public async Task<IActionResult> Restore(long id, CancellationToken ct)
        {
            await productService.RestoreAsync(id, ct);
            return NoContent();
        }
    }
}
