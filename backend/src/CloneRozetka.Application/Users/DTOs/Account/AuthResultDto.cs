namespace CloneRozetka.Application.Users.DTOs.Account
{
    public class AuthResultDto
    {
        public string Token { get; set; } = default!;
        public DateTime ExpiresAt { get; set; }
        public string UserName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public IEnumerable<string> Roles { get; set; } = Enumerable.Empty<string>();
    }
}
