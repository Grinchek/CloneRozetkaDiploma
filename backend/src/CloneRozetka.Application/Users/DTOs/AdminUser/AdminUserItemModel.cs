namespace CloneRozetka.Application.Users.DTOs.AdminUser
{
    public class AdminUserItemModel
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string Image { get; set; } = string.Empty;

        /// <summary>Пошта підтверджена (Identity EmailConfirmed або наш IsEmailVarified).</summary>
        public bool EmailConfirmed { get; set; }

        public bool IsLoginGoogle { get; set; }
        public bool IsLoginPassword { get; set; }

        public List<string> Roles { get; set; } = new();
        public List<string> LoginTypes { get; set; } = new();

        public DateTimeOffset? LockoutEnd { get; set; }

        public bool IsLocked =>
            LockoutEnd.HasValue && LockoutEnd.Value > DateTimeOffset.UtcNow;
    }
}
