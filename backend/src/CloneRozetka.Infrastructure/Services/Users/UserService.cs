using AutoMapper;
using AutoMapper.QueryableExtensions;
using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Search;
using CloneRozetka.Application.Search.Params;
using CloneRozetka.Application.Users.DTOs.AdminUser;
using CloneRozetka.Infrastructure.Identity;
using CloneRozetka.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CloneRozetka.Infrastructure.Services.Users
{
    public class UserService(UserManager<AppUser> userManager,
    IMapper mapper,
    IImageService imageService,
    RoleManager<AppRole> roleManager,
    AppDbContext context) : IUserService
    {
        public async Task<SearchResult<AdminUserItemModel>> SearchUsersAsync(UserSearchModel model)
        {
            var query = userManager.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(model.Name))
            {
                string nameFilter = model.Name.Trim().ToLower().Normalize();

                query = query.Where(u =>
                    (u.FullName).ToLower().Contains(nameFilter) ||
                    u.FullName.ToLower().Contains(nameFilter));
            }

            if (model?.StartDate != null)
            {
                query = query.Where(u => u.CreatedAt >= model.StartDate);
            }

            if (model?.EndDate != null)
            {
                query = query.Where(u => u.CreatedAt <= model.EndDate);
            }

            if (model.Roles != null && model.Roles.Any())
            {
                var roles = model.Roles.Where(x => !string.IsNullOrEmpty(x));
                if (roles.Count() > 0)
                    query = query.Where(user => roles.Any(role => user.UserRoles.Select(x => x.Role.Name).Contains(role)));
            }

            var totalCount = await query.CountAsync();

            var safeItemsPerPage = model.ItemPerPAge < 1 ? 10 : model.ItemPerPAge;
            var totalPages = (int)Math.Ceiling(totalCount / (double)safeItemsPerPage);
            var safePage = Math.Min(Math.Max(1, model.Page), Math.Max(1, totalPages));

            var users = await query
                .OrderBy(u => u.Id)
                .Skip((safePage - 1) * safeItemsPerPage)
                .Take(safeItemsPerPage)
                .ProjectTo<AdminUserItemModel>(mapper.ConfigurationProvider)
                .ToListAsync();

            //await LoadLoginsAndRolesAsync(users);

            return new SearchResult<AdminUserItemModel>
            {
                Items = users,
                Pagination = new PaginationModel
                {
                    TotalCount = totalCount,
                    TotalPages = totalPages,
                    ItemsPerPage = safeItemsPerPage,
                    CurrentPage = safePage
                }
            };
        }

    }
}
