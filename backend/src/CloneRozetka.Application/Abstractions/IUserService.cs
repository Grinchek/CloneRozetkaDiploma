
using CloneRozetka.Application.Search;
using CloneRozetka.Application.Search.Params;
using CloneRozetka.Application.Users.DTOs.AdminUser;

namespace CloneRozetka.Application.Abstractions
{
    public interface IUserService
    {
        Task<SearchResult<AdminUserItemModel>> SearchUsersAsync(UserSearchModel model);
    }
}
