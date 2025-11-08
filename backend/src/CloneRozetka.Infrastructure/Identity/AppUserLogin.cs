using Microsoft.AspNetCore.Identity;

namespace CloneRozetka.Infrastructure.Identity;

public class AppUserLogin : IdentityUserLogin<int>
{
    public AppUser User { get; set; }// = new();
}
