namespace CloneRozetka.Application.Users.DTOs.Account;

public class UserProfileDto
{
    public string? Email { get; set; }
    public string? UserName { get; set; }
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsEmailConfirmed { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? Role { get; set; }
}
