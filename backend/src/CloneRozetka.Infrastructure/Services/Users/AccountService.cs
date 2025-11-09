
using AutoMapper;
using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Users.DTOs;
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
    IImageService imageService
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
