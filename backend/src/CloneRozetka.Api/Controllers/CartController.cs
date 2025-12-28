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
            {
                return BadRequest();
            }

            await service.AddAsync(dto);

            var items = await service.ListAsync(dto.UserId);

            return Ok(items);
        }
    }
}