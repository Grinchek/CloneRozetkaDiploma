using Microsoft.AspNetCore.Identity;
using CloneRozetka.Domain.Entities;

namespace CloneRozetka.Infrastructure.Identity
{
    public class AppUser : IdentityUser<int>
    {
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? GoogleId { get; set; }

        public bool IsEmailVarified { get; set; }
        public DateTime CreatedAt { get; set; }= DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
        public bool IsBlocked { get; set; } = false;

        public virtual ICollection<AppUserRole>? UserRoles { get; set; }
        public virtual ICollection<AppUserLogin>? UserLogins { get; set; }


        public User ToDomain()
        {
            return new User
            {
                Id = Id,
                FullName = FullName,
                AvatarUrl = AvatarUrl,
                Email = Email,
                GoogleId = GoogleId,
                IsEmailVarified = IsEmailVarified,
                CreatedAt = CreatedAt,
                LastLoginAt = LastLoginAt,
                IsBlocked = IsBlocked
            };
        }


        public static AppUser FromDomain(User user)
        {
            return new AppUser
            {
                Id = user.Id,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Email = user.Email,
                UserName = user.Email,
                GoogleId = user.GoogleId,
                IsEmailVarified = user.IsEmailVarified,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                IsBlocked = user.IsBlocked
            };
        }
    }
}
