using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Users.DTOs;
using CloneRozetka.Application.Users.Interfaces;
using CloneRozetka.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;

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

            var token = await _jwt.CreateTokenAsync(user); 
            return Ok(new { token });
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            Console.WriteLine($"Login attempt: {dto.UserNameOrEmail}");

            var user = await _userManager.FindByNameAsync(dto.UserNameOrEmail)
                        ?? await _userManager.FindByEmailAsync(dto.UserNameOrEmail);

            if (user == null)
            {
                Console.WriteLine("User not found");
                return Unauthorized(new { error = "User not found" });
            }

            var check = await _signIn.CheckPasswordSignInAsync(user, dto.Password, false);
            Console.WriteLine($"Password check result: {check.Succeeded}");

            if (!check.Succeeded)
                return Unauthorized(new { error = "Invalid credentials" });

            var token = await _jwt.CreateTokenAsync(user);
            return Ok(new { token });
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> Me()
        {
            var userName = User?.Identity?.Name;
            if (string.IsNullOrEmpty(userName))
                return Unauthorized();

            var user = await _userManager.FindByNameAsync(userName);
            if (user == null) return Unauthorized();

            return Ok(new
            {
                isAuthenticated = true,
                name = user.FullName ?? user.UserName,
                email = user.Email,
                avatarUrl = user.AvatarUrl
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
        [HttpPost]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel model)
        {
            bool res = await accountService.ForgotPasswordAsync(model);
            if (res)
                return Ok();
            else
                return BadRequest(new
                {
                    Status = 400,
                    IsValid = false,
                    Errors = new { Email = "Користувача з такою поштою не існує" }
                });
        }

        [HttpPost]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
        {
            await accountService.ResetPasswordAsync(model);
            return Ok();
        }


    }
}
