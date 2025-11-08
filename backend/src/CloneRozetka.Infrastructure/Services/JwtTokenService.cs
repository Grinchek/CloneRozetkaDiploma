using CloneRozetka.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CloneRozetka.Infrastructure.Services
{
    public class JwtTokenService(IConfiguration configuration, UserManager<AppUser> userManager) : IJwtTokenService
    {
        public async Task<string> CreateTokenAsync(AppUser user)
        {
            var key = configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured");
            var issuer = configuration["Jwt:Issuer"];   
            var audience = configuration["Jwt:Audience"];

            var claims = new List<Claim>
{
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),  
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim("fullName", user.FullName ?? string.Empty),
                new Claim("avatarUrl", user.AvatarUrl ?? string.Empty)
            };


            var roles = await userManager.GetRolesAsync(user);
            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));


            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);


            var token = new JwtSecurityToken(
                issuer: issuer,               
                audience: audience,            
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
