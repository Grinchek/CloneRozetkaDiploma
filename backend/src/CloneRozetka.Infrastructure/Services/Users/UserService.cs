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
            //SQL запит до бд
            var query = userManager.Users.AsQueryable();
            // фільтрація по імені
            if (!string.IsNullOrWhiteSpace(model.Name))
            {
                // нормалізація рядка для пошуку до нижнього регістру та видалення зайвих пробілів
                string nameFilter = model.Name.Trim().ToLower().Normalize();
                // додавання умови фільтрації до запиту (перевірка чи містить ім'я користувача підрядок пошукового запиту)
                query = query.Where(u => u.FullName!.ToLower().Contains(nameFilter));
            }
            // фільтрація по датах створення користувача
            if (model?.StartDate != null)
            {
                // додавання умови фільтрації до запиту (перевірка чи дата створення користувача більша або дорівнює початковій даті)
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
            // отримання загальної кількості користувачів, що відповідають умовам фільтрації
            var totalCount = await query.CountAsync();
            // розрахунок параметрів пагінації (безпечна кількість елементів на сторінку, загальна кількість сторінок, безпечний номер поточної сторінки)
            var safeItemsPerPage = model.ItemPerPAge < 1 ? 10 : model.ItemPerPAge;
            // округлення вгору для отримання загальної кількості сторінок
            var totalPages = (int)Math.Ceiling(totalCount / (double)safeItemsPerPage);
            // забезпечення, що номер сторінки знаходиться в межах допустимого діапазону
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
