using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Search.Params;
using CloneRozetka.Application.Users.DTOs.AdminUser;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace CloneRozetka.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(IUserService userService) : ControllerBase
    {

        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] UserSearchModel model)
        {
            Stopwatch stopWatch = new Stopwatch();
            stopWatch.Start();
            var result = await userService.SearchUsersAsync(model);
            stopWatch.Stop();
            // Get the elapsed time as a TimeSpan value.
            TimeSpan ts = stopWatch.Elapsed;

            // Format and display the TimeSpan value.
            string elapsedTime = String.Format("{0:00}:{1:00}:{2:00}.{3:00}",
                ts.Hours, ts.Minutes, ts.Seconds,
                ts.Milliseconds / 10);
            Console.WriteLine("-----------Elapsed Time------------: " + elapsedTime);
            return Ok(result);
        }
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int itemsPerPage = 10)
        {
            var result = await userService.GetAllUsersAsync(page, itemsPerPage);
            return Ok(result);
        }
        [HttpPut]
        public async Task<IActionResult> Edit([FromBody] AdminUserEditModel model)
        {
            if (model == null)
                return BadRequest("User Id is required");

            await userService.EditUserAsync(model);
            return Ok(new { message = "User updated successfully" });
        }
        [HttpPut]
        [Route("change-role")]
        public async Task<IActionResult> ChangeRole([FromBody] AdminUserEditModel model)
        {
            if (model == null)
                return BadRequest("User Id and Role are required");
            await userService.ChangeUserRoleAsync(model);
            return Ok(new { message = "User role changed successfully" });
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("User Id is required");

            await userService.DeleteUserAsync(id.ToString());
            return Ok(new { message = "User deleted successfully" });
        }

    }
}
