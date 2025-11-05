using System.Security.Claims;
using CloneRozetka.Application.Users.Interfaces;
using CloneRozetka.Domain.Entities.Identity;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.Api.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous] 
public class AccountController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IJwtTokenService _jwt;
    private readonly IHttpClientFactory _http;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _cfg;

    public AccountController(
        UserManager<AppUser> userManager,
        IJwtTokenService jwt,
        IHttpClientFactory http,
        IWebHostEnvironment env,
        IConfiguration cfg)
    {
        _userManager = userManager;
        _jwt = jwt;
        _http = http;
        _env = env;
        _cfg = cfg;
    }

    // 1) Старт зовнішнього логіну
    [HttpGet("external-login/google")]
    public IActionResult ExternalLoginGoogle([FromQuery] string? returnUrl = null)
    {
        var cbPath = _cfg["GoogleAuth:CallbackPath"] ?? "/api/auth/google/callback";
        var ret = returnUrl ?? _cfg["GoogleAuth:ReturnUrl"] ?? "/";

        var redirectUri = $"https://localhost:7057{cbPath}";

        var props = new AuthenticationProperties { RedirectUri = redirectUri };
        props.Items["returnUrl"] = ret;

        return Challenge(props, GoogleDefaults.AuthenticationScheme);
    }



    // 2) Callback від Google (шлях має збігатися з GoogleAuth:CallbackPath)
    [HttpGet("google/callback")]
    public async Task<IActionResult> ExternalLoginCallback()
    {
        // Перевірка результату Google-автентифікації (сюди прийдемо тільки після успішного челенджу)
        var authResult = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
        if (authResult?.Succeeded != true || authResult.Principal is null)
            return BadRequest("Google authentication failed.");

        var principal = authResult.Principal;
        var email = principal.FindFirstValue(ClaimTypes.Email) ?? principal.FindFirst("email")?.Value;
        var firstName = principal.FindFirstValue(ClaimTypes.GivenName);
        var lastName = principal.FindFirstValue(ClaimTypes.Surname);
        var providerKey = principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue("sub");
        var pictureUrl = principal.FindFirst("picture")?.Value ?? principal.FindFirst("urn:google:picture")?.Value;

        if (string.IsNullOrWhiteSpace(email))
            return BadRequest("Email is required from Google.");

        // Знайти/створити користувача
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new AppUser
            {
                UserName = email,
                Email = email,
                FullName = string.Join(' ', new[] { firstName, lastName }.Where(s => !string.IsNullOrWhiteSpace(s))),
                GoogleId = providerKey,
                EmailConfirmed = true
            };

            var create = await _userManager.CreateAsync(user);
            if (!create.Succeeded)
                return BadRequest(create.Errors.Select(e => e.Description));
        }
        else if (string.IsNullOrEmpty(user.GoogleId) && !string.IsNullOrEmpty(providerKey))
        {
            user.GoogleId = providerKey;
            await _userManager.UpdateAsync(user);
        }

        // Прив'язка зовнішнього логіну до AspNetUserLogins (опційно, але корисно)
        if (!string.IsNullOrEmpty(providerKey))
        {
            var logins = await _userManager.GetLoginsAsync(user);
            if (!logins.Any(l => l.LoginProvider == "Google"))
            {
                var info = new UserLoginInfo("Google", providerKey, "Google");
                await _userManager.AddLoginAsync(user, info);
            }
        }

        // Завантажити аватар (опційно)
        if (!string.IsNullOrWhiteSpace(pictureUrl))
        {
            var localPath = await DownloadAndSaveAvatarAsync(pictureUrl, user.Id);
            if (!string.IsNullOrEmpty(localPath))
            {
                var claims = await _userManager.GetClaimsAsync(user);
                var old = claims.FirstOrDefault(c => c.Type == "avatar");
                if (old != null) await _userManager.RemoveClaimAsync(user, old);
                await _userManager.AddClaimAsync(user, new Claim("avatar", localPath));
                await _userManager.UpdateAsync(user);
            }
        }

        // Видати JWT
        var token = _jwt.CreateTokenAsync(user);

        // Повернутися на фронт
        var ret =
            (authResult.Properties?.Items.TryGetValue("returnUrl", out var fromItems) == true && !string.IsNullOrWhiteSpace(fromItems))
                ? fromItems
                : _cfg["GoogleAuth:ReturnUrl"];

        // Очистити тимчасовий зовнішній кукі, щоб не заважав подальшим логінам
        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

        if (!string.IsNullOrWhiteSpace(ret))
        {
            //var exp = Uri.EscapeDataString(token.ExpiresAt.ToUniversalTime().ToString("o"));
            //var url = $"{ret}#token={Uri.EscapeDataString(token.Token)}&exp={exp}";
            return Redirect("duplo");
        }

        // Фолбек для Postman/мобільних клієнтів
        return Ok(token);
    }


    /// <summary>
    /// Скачати аватар у wwwroot/avatars/{userId}_{guid}.{ext}. Повертає відносний шлях "/avatars/xxx.ext".
    /// </summary>
    private async Task<string?> DownloadAndSaveAvatarAsync(string url, int userId)
    {
        try
        {
            var client = _http.CreateClient();
            using var resp = await client.GetAsync(url);
            if (!resp.IsSuccessStatusCode) return null;

            var contentType = resp.Content.Headers.ContentType?.MediaType?.ToLowerInvariant();
            var ext = contentType switch
            {
                "image/jpeg" or "image/jpg" => ".jpg",
                "image/png" => ".png",
                "image/webp" => ".webp",
                _ => ".jpg"
            };

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var dir = Path.Combine(webRoot, "avatars");
            Directory.CreateDirectory(dir);

            var fileName = $"{userId}_{Guid.NewGuid():N}{ext}";
            var absPath = Path.Combine(dir, fileName);

            await using (var fs = System.IO.File.Create(absPath))
                await resp.Content.CopyToAsync(fs);

            return $"/avatars/{fileName}";
        }
        catch
        {
            return null;
        }
    }
}
