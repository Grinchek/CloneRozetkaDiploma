// Domain: CloneRozetka.Infrastructure/Identity/AppRole.cs
using Microsoft.AspNetCore.Identity;

namespace CloneRozetka.Domain.Entities.Identity
{
    public class AppRole: IdentityRole<int>
    {
        public string? Description { get; set; }

        public virtual ICollection<AppUserRole>? UserRoles { get; set; }
    }
}
