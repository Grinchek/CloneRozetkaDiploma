using CloneRozetka.Application.Users.Interfaces;
using CloneRozetka.Application.Users.DTOs;
using CloneRozetka.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signIn;
        private readonly IJwtTokenService _jwt;
        private readonly IAccountService accountService;

        public AuthController(UserManager<AppUser> userManager, SignInManager<AppUser> signIn, IJwtTokenService jwt, IAccountService accountService )
        {
            _userManager = userManager;
            _signIn = signIn;
            _jwt = jwt;
            this.accountService = accountService;
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {

            var user = new AppUser
            {
                UserName = dto.UserName,
                Email = dto.Email,
                FullName = dto.FullName
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });


            var roles = await _userManager.GetRolesAsync(user);
            var token = _jwt.CreateToken(user.Id, user.UserName!, user.Email, roles); 

            return Ok(token);
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {

            AppUser? user = await _userManager.FindByNameAsync(dto.UserNameOrEmail)
                             ?? await _userManager.FindByEmailAsync(dto.UserNameOrEmail);

            if (user == null)
                return Unauthorized(new { error = "User not found" });

            var check = await _signIn.CheckPasswordSignInAsync(
                user, dto.Password, lockoutOnFailure: false);

            if (!check.Succeeded)
                return Unauthorized(new { error = "Invalid credentials" });

            var roles = await _userManager.GetRolesAsync(user);
            var token = _jwt.CreateToken(user.Id, user.UserName!, user.Email, roles);
            return Ok(token);
        }

        [HttpGet]
        public IActionResult Me()
        {
           
            return Ok(new
            {
                IsAuthenticated = User?.Identity?.IsAuthenticated ?? false,
                Name = User?.Identity?.Name,
                Claims = User?.Claims.Select(c => new { c.Type, c.Value }) ?? Enumerable.Empty<object>()
            });
        }


        [HttpPost]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequestModel model)
        {
            string result = await accountService.LoginByGoogle(model.Token);
            if (string.IsNullOrEmpty(result))
            {
                return BadRequest(new
                {
                    Status = 400,
                    IsValid = false,
                    Errors = new { Email = "Помилка реєстрації" }
                });
            }
            return Ok(new
            {
                Token = result
            });
        }

    }
}
