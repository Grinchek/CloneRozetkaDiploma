using Microsoft.AspNetCore.Identity;

namespace CloneRozetka.Domain.Entities.Identity;

public class AppUserLogin : IdentityUserLogin<int>
{
    public AppUser User { get; set; }// = new();
}
