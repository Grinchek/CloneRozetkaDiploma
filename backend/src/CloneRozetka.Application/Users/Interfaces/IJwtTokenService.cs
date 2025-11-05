using CloneRozetka.Application.Users.DTOs;

namespace CloneRozetka.Application.Users.Interfaces
{
    public interface IJwtTokenService
    {
        AuthResultDto CreateToken(
           int userId,
           string userName,
           string? email,
           IEnumerable<string> roles);
    }
}
