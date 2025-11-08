
using Microsoft.AspNetCore.Identity;

namespace CloneRozetka.Infrastructure.Identity;

public class AppUserRole : IdentityUserRole<int>
{
    public virtual AppUser User { get; set; }// = new();
    public virtual AppRole Role { get; set; }// = new();
}