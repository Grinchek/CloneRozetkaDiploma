namespace CloneRozetka.Application.Users.DTOs
{
    public class UserDto
    {
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Email { get; set; }
        public string? GoogleId { get; set; }
        public bool IsEmailVarified { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
