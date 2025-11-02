using CloneRozetka.Application.Users.DTOs;
using CloneRozetka.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signIn;

        public AuthController(UserManager<AppUser> userManager, SignInManager<AppUser> signIn)
        {
            _userManager = userManager;
            _signIn = signIn;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            // Перевірка унікального email (у тебе вже opt.User.RequireUniqueEmail = true)
            var user = new AppUser
            {
                UserName = dto.UserName,
                Email = dto.Email,
                FullName = dto.FullName
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            return Ok(new
            {
                message = "User created",
                userId = user.Id,
                user.UserName,
                user.Email
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            // Знаходимо користувача або по UserName, або по Email
            AppUser? user = await _userManager.FindByNameAsync(dto.UserNameOrEmail)
                             ?? await _userManager.FindByEmailAsync(dto.UserNameOrEmail);

            if (user == null)
                return Unauthorized(new { error = "User not found" });

            var check = await _signIn.CheckPasswordSignInAsync(
                user, dto.Password, lockoutOnFailure: false);

            if (!check.Succeeded)
                return Unauthorized(new { error = "Invalid credentials" });

            // Поки без JWT/кукі — просто підтвердження
            return Ok(new
            {
                message = "Login OK",
                userId = user.Id,
                user.UserName,
                user.Email
            });
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            // Без JWT це завжди анонім — додамо [Authorize] і токени пізніше
            return Ok(new
            {
                IsAuthenticated = User?.Identity?.IsAuthenticated ?? false,
                Name = User?.Identity?.Name,
                Claims = User?.Claims.Select(c => new { c.Type, c.Value }) ?? Enumerable.Empty<object>()
            });
        }
    }
}
