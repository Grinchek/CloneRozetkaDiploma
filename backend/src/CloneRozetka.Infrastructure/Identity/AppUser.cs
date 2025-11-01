// Domain: CloneRozetka.Infrastructure.Identity
using Microsoft.AspNetCore.Identity;

namespace CloneRozetka.Infrastructure.Identity
{
    public class AppUser : IdentityUser<int>
    {
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }

        public string? GoogleId { get; set; }

        public bool IsEmailVarified { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? LastLoginAt { get; set; }

        public bool IsBlocked { get; set; } = false;


    }
}
