using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Categories.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.Api.Controllers
{
    [ApiController]
    [Route("api/cart")]
    public class CartController(ICartService service) : ControllerBase
    {
        [HttpGet("{userId:int}")]
        public async Task<ActionResult<IEnumerable<CartItemDTO>>> Get(int userId)
        {
            var items = await service.ListAsync(userId);
            return Ok(items);
        }

        [HttpPost]
        public async Task<ActionResult<IEnumerable<CartItemDTO>>> Add([FromBody] CartItemDTO dto)
        {
            if (dto is null)
                return BadRequest();

            await service.AddAsync(dto);
            return Ok(await service.ListAsync(dto.UserId));
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] CartItemDTO dto)
        {
            if (dto is null)
                return BadRequest();

            await service.UpdateAsync(dto);
            return NoContent();
        }

        [HttpDelete("{userId:int}/{productId:long}")]
        public async Task<IActionResult> Delete(int userId, long productId)
        {
            await service.DeleteAsync(userId, productId);
            return NoContent();
        }
    }
}