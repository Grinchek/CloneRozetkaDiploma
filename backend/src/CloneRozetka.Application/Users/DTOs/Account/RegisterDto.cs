using Microsoft.AspNetCore.Http;

namespace CloneRozetka.Application.Users.DTOs.Account
{
    public class RegisterDto
    {
        public string UserName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string? FullName { get; set; }
        public IFormFile? Avatar { get; set; }
    }
}
