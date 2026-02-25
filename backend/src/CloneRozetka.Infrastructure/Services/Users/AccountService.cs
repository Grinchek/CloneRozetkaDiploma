
using AutoMapper;
using CloneRozetka.Application;
using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Users.DTOs.Account;
using CloneRozetka.Application.Users.Interfaces;
using CloneRozetka.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text.Json;

namespace CloneRozetka.Infrastructure.Services.Users;

public class AccountService(IJwtTokenService tokenService,
    UserManager<AppUser> userManager,
    IMapper mapper,
    IConfiguration configuration,
    IImageService imageService,
    ISmtpService smtpService
    ) : IAccountService
{
    public async Task<string> LoginByGoogle(string token)
    {
        try
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);

            var userInfoUrl = configuration["GoogleUserInfo"]
                              ?? "https://www.googleapis.com/oauth2/v3/userinfo";

            var response = await httpClient.GetAsync(userInfoUrl);
            if (!response.IsSuccessStatusCode)
                return string.Empty;

            var json = await response.Content.ReadAsStringAsync();

            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var googleUser = JsonSerializer.Deserialize<GoogleAccountModel>(json, options);
            if (googleUser == null || string.IsNullOrWhiteSpace(googleUser.Email))
                return string.Empty;

            var existingUser = await userManager.FindByEmailAsync(googleUser.Email);
            if (existingUser != null)
            {

                if (!string.IsNullOrWhiteSpace(googleUser.GoogleId))
                {
                    var userLoginGoogle = await userManager.FindByLoginAsync("Google", googleUser.GoogleId);
                    if (userLoginGoogle == null)
                    {
                        await userManager.AddLoginAsync(existingUser,
                            new UserLoginInfo("Google", googleUser.GoogleId, "Google"));
                    }
                }
                return await tokenService.CreateTokenAsync(existingUser);
            }

            var user = new AppUser
            {
                Email = googleUser.Email,
                UserName = googleUser.Email, 
                FullName = googleUser.Name
            };

            if (!string.IsNullOrWhiteSpace(googleUser.Picture))
            {
                try
                {
                    user.AvatarUrl = await imageService.SaveImageFromUrlAsync(googleUser.Picture);
                }
                catch
                {

                }
            }

            var createRes = await userManager.CreateAsync(user);
            if (!createRes.Succeeded)
                return string.Empty;

            if (!string.IsNullOrWhiteSpace(googleUser.GoogleId))
            {
                await userManager.AddLoginAsync(user, new UserLoginInfo(
                    loginProvider: "Google",
                    providerKey: googleUser.GoogleId,
                    displayName: "Google"
                ));
            }

            return await tokenService.CreateTokenAsync(user);
        }
        catch
        {

            return string.Empty;
        }
    }
    public async Task<bool> ForgotPasswordAsync(ForgotPasswordModel model)
    {
        var user = await userManager.FindByEmailAsync(model.Email);

        if (user == null)
        {
            return false;
        }

        string token = await userManager.GeneratePasswordResetTokenAsync(user);
        var resetLink = $"{configuration["ClientUrl"]}/reset-password?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(model.Email)}";

        var emailModel = new EmailMessage
        {
            To = model.Email,
            Subject = "Password Reset",
            Body = $"<p>Click the link below to reset your password:</p><a href='{resetLink}'>Reset Password</a>"
        };

        var result = await smtpService.SendEmailAsync(emailModel);

        return result;
    }
    public async Task<bool> ValidateResetTokenAsync(ValidateResetTokenModel model)
    {
        var user = await userManager.FindByEmailAsync(model.Email);
        if (user == null) return false;

        return await userManager.VerifyUserTokenAsync(
            user,
            TokenOptions.DefaultProvider,
            "ResetPassword",
            model.Token);
    }

    public async Task ResetPasswordAsync(ResetPasswordModel model)
    {
        var user = await userManager.FindByEmailAsync(model.Email);

        if (user != null)
            await userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
    }

    public async Task<UserProfileDto?> GetProfileAsync(int userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null) return null;

        var roles = await userManager.GetRolesAsync(user);
        var mainRole = roles.FirstOrDefault() ?? "User";

        return new UserProfileDto
        {
            Email = user.Email,
            UserName = user.UserName,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            AvatarUrl = user.AvatarUrl,
            IsEmailConfirmed = user.EmailConfirmed,
            CreatedAt = user.CreatedAt,
            Role = mainRole
        };
    }

    public async Task<UserProfileDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null) return null;

        if (request.FullName != null)
            user.FullName = request.FullName.Trim().Length > 0 ? request.FullName.Trim() : null;
        if (request.PhoneNumber != null)
            user.PhoneNumber = request.PhoneNumber.Trim().Length > 0 ? request.PhoneNumber.Trim() : null;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded) return null;

        return await GetProfileAsync(userId);
    }

    public async Task<(bool Succeeded, IReadOnlyList<string> Errors)> ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return (false, new List<string> { "Користувача не знайдено." });

        var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (result.Succeeded)
            return (true, Array.Empty<string>());
        var errors = result.Errors.Select(e => e.Description).ToList();
        return (false, errors);
    }

    public async Task<bool> ConfirmEmailAsync(int userId, string token)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null) return false;

        // Деякі клієнти пошти або query string передають пробіл замість + у токені
        token = token.Replace(' ', '+');
        // Подвійне (або потрійне) кодування посилання в листі — декодуємо до стабільного вигляду
        string decodedToken;
        var prev = "";
        decodedToken = token;
        while (decodedToken != prev)
        {
            prev = decodedToken;
            decodedToken = Uri.UnescapeDataString(decodedToken);
        }

        var result = await userManager.ConfirmEmailAsync(user, decodedToken);
        if (result.Succeeded && !user.IsEmailVarified)
        {
            user.IsEmailVarified = true;
            await userManager.UpdateAsync(user);
        }
        return result.Succeeded;
    }

    public async Task<bool> ResendConfirmationEmailAsync(int userId)
    {
        var (success, _) = await TryResendConfirmationEmailAsync(userId);
        return success;
    }

    public async Task<(bool Success, string? ErrorMessage)> TryResendConfirmationEmailAsync(int userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null) return (false, "Користувача не знайдено.");
        if (string.IsNullOrEmpty(user.Email)) return (false, "Email не вказано.");
        if (user.EmailConfirmed) return (false, "Email вже підтверджено.");

        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var clientUrl = configuration["ClientUrl"]?.TrimEnd('/') ?? "http://localhost:5173";
        var link = $"{clientUrl}/confirm-email?userId={userId}&token={Uri.EscapeDataString(token)}";

        var emailModel = new EmailMessage
        {
            To = user.Email,
            Subject = "Підтвердження email",
            Body = $"<p>Натисніть посилання для підтвердження email:</p><a href='{link}'>Підтвердити email</a>"
        };

        var sent = await smtpService.SendEmailAsync(emailModel);
        if (!sent) return (false, "Не вдалося надіслати лист. Перевірте налаштування SMTP або спробуйте пізніше.");
        return (true, null);
    }

    public sealed class GoogleAccountModel
    {

        public string? Sub { get; set; }
        public string? Email { get; set; }
        public string? Name { get; set; }
        public string? Picture { get; set; }

        // зручно звести до однієї властивості
        public string? GoogleId => !string.IsNullOrWhiteSpace(Sub) ? Sub : null;
    }

}
