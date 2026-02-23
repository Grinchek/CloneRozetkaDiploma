using System.Security.Claims;
using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Users.DTOs.Account;
using CloneRozetka.Application.Users.Interfaces;
using CloneRozetka.Infrastructure.Identity;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.Api.Controllers;

[ApiController]
[Route("api/account")]
public class AccountController : ControllerBase
{
    private readonly IAccountService _accountService;
    private readonly IImageService _imageService;
    private readonly UserManager<AppUser> _userManager;
    private readonly IValidator<UpdateProfileRequest> _profileValidator;
    private readonly IValidator<ChangePasswordRequest> _changePasswordValidator;

    public AccountController(
        IAccountService accountService,
        IImageService imageService,
        UserManager<AppUser> userManager,
        IValidator<UpdateProfileRequest> profileValidator,
        IValidator<ChangePasswordRequest> changePasswordValidator)
    {
        _accountService = accountService;
        _imageService = imageService;
        _userManager = userManager;
        _profileValidator = profileValidator;
        _changePasswordValidator = changePasswordValidator;
    }

    private int? GetUserId()
    {
        var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(id, out var userId) ? userId : null;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> GetMe()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var profile = await _accountService.GetProfileAsync(userId.Value);
        if (profile == null) return NotFound();
        return Ok(profile);
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var validation = await _profileValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(new { errors = validation.Errors.Select(e => e.ErrorMessage) });

        var updated = await _accountService.UpdateProfileAsync(userId.Value, request);
        if (updated == null) return BadRequest();
        return Ok(updated);
    }

    [HttpPost("avatar")]
    [Authorize]
    public async Task<ActionResult<object>> UploadAvatar(IFormFile? file)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        if (file == null || file.Length == 0)
            return BadRequest(new { errors = new[] { "Файл не обрано або порожній." } });
        if (!file.ContentType.StartsWith("image/"))
            return BadRequest(new { errors = new[] { "Avatar має бути зображенням." } });

        var avatarUrl = await _imageService.SaveImageAsync(file);
        var user = await _userManager.FindByIdAsync(userId.Value.ToString());
        if (user == null) return Unauthorized();

        user.AvatarUrl = avatarUrl;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        return Ok(new { avatarUrl });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var validation = await _changePasswordValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(new { errors = validation.Errors.Select(e => e.ErrorMessage) });

        var (succeeded, errors) = await _accountService.ChangePasswordAsync(userId.Value, request);
        if (!succeeded)
            return BadRequest(new { errors = errors });
        return Ok();
    }

    [HttpGet("confirm-email")]
    [AllowAnonymous]
    public async Task<IActionResult> ConfirmEmail([FromQuery] int userId, [FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return BadRequest(new { error = "Token обов'язковий." });

        var ok = await _accountService.ConfirmEmailAsync(userId, token);
        if (!ok)
            return BadRequest(new { error = "Не вдалося підтвердити email. Перевірте посилання або запитайте новий лист." });
        return Ok(new { message = "Email підтверджено." });
    }

    [HttpPost("resend-confirmation")]
    [Authorize]
    public async Task<IActionResult> ResendConfirmation()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var ok = await _accountService.ResendConfirmationEmailAsync(userId.Value);
        if (!ok)
            return BadRequest(new { error = "Email вже підтверджено або не вдалося надіслати лист." });
        return Ok(new { message = "Лист надіслано." });
    }
}
