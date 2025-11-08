using CloneRozetka.Infrastructure.Identity;

public interface IJwtTokenService
{
    Task<string> CreateTokenAsync(AppUser user);
}
