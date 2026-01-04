namespace CloneRozetka.Application.Users.DTOs.AdminUser
{
    public class AdminUserEditModel
    {
        public int Id { get; set; } = default!;
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }


        public List<string>? Roles { get; set; }

        public string? NewImageBase64 { get; set; }
    }
}
