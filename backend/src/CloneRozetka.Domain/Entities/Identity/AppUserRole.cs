
using Microsoft.AspNetCore.Identity;

namespace CloneRozetka.Domain.Entities.Identity;

public class AppUserRole : IdentityUserRole<int>
{
    public virtual AppUser User { get; set; }// = new();
    public virtual AppRole Role { get; set; }// = new();
}