using CloneRozetka.Application.Users.DTOs;
using CloneRozetka.Domain.Entities.Identity;

namespace CloneRozetka.Application.Users.Interfaces
{
    public interface IJwtTokenService
    {
        Task<string> CreateTokenAsync(AppUser user);
    }
}
