using AutoMapper;
using AutoMapper.QueryableExtensions;
using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Search;
using CloneRozetka.Application.Search.Params;
using CloneRozetka.Application.Users.DTOs.AdminUser;
using CloneRozetka.Domain.Entities;
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
        public async Task<SearchResult<AdminUserItemModel>> GetAllUsersAsync(int page = 1, int itemsPerPage = 10)
        {
            var query = userManager.Users.AsQueryable();

            var totalCount = await query.CountAsync();

            var safeItemsPerPage = itemsPerPage < 1 ? 10 : itemsPerPage;
            var totalPages = (int)Math.Ceiling(totalCount / (double)safeItemsPerPage);
            var safePage = Math.Min(Math.Max(1, page), Math.Max(1, totalPages));

            var users = await query
                .OrderBy(u => u.Id)
                .Skip((safePage - 1) * safeItemsPerPage)
                .Take(safeItemsPerPage)
                .ProjectTo<AdminUserItemModel>(mapper.ConfigurationProvider)
                .ToListAsync();

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
        public async Task EditUserAsync(AdminUserEditModel model)
        {
            var user = await userManager.Users
                .Include(x => x.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(x => x.Id == model.Id);

            if (user == null)
                throw new Exception("User not found");

            if (!string.IsNullOrWhiteSpace(model.FullName))
                user.FullName = model.FullName.Trim();

            if (!string.IsNullOrWhiteSpace(model.Email) && model.Email != user.Email)
            {
                // важливо для Identity
                var setEmail = await userManager.SetEmailAsync(user, model.Email.Trim());
                if (!setEmail.Succeeded)
                    throw new Exception(string.Join("; ", setEmail.Errors.Select(e => e.Description)));

                var setUserName = await userManager.SetUserNameAsync(user, model.Email.Trim());
                if (!setUserName.Succeeded)
                    throw new Exception(string.Join("; ", setUserName.Errors.Select(e => e.Description)));
            }

            if (!string.IsNullOrWhiteSpace(model.PhoneNumber))
            {
                var setPhone = await userManager.SetPhoneNumberAsync(user, model.PhoneNumber.Trim());
                if (!setPhone.Succeeded)
                    throw new Exception(string.Join("; ", setPhone.Errors.Select(e => e.Description)));
            }


            if (!string.IsNullOrWhiteSpace(model.NewImageBase64))
            {

                var imagePath = await imageService.SaveImageFromBase64Async(model.NewImageBase64);
                user.AvatarUrl = imagePath; 
            }

            if (model.Roles != null)
            {
                var newRoles = model.Roles
                    .Where(r => !string.IsNullOrWhiteSpace(r))
                    .Select(r => r.Trim())
                    .Distinct()
                    .ToList();


                if (newRoles.Count > 0)
                {
                    var existingRoleNames = await roleManager.Roles.Select(r => r.Name!).ToListAsync();
                    var wrong = newRoles.Except(existingRoleNames).ToList();
                    if (wrong.Count > 0)
                        throw new Exception("Unknown roles: " + string.Join(", ", wrong));
                }

                var currentRoles = await userManager.GetRolesAsync(user);

                var toAdd = newRoles.Except(currentRoles).ToList();
                var toRemove = currentRoles.Except(newRoles).ToList();

                if (toRemove.Count > 0)
                {
                    var removeRes = await userManager.RemoveFromRolesAsync(user, toRemove);
                    if (!removeRes.Succeeded)
                        throw new Exception(string.Join("; ", removeRes.Errors.Select(e => e.Description)));
                }

                if (toAdd.Count > 0)
                {
                    var addRes = await userManager.AddToRolesAsync(user, toAdd);
                    if (!addRes.Succeeded)
                        throw new Exception(string.Join("; ", addRes.Errors.Select(e => e.Description)));
                }
            }

            // 4) Зберегти
            var updateRes = await userManager.UpdateAsync(user);
            if (!updateRes.Succeeded)
                throw new Exception(string.Join("; ", updateRes.Errors.Select(e => e.Description)));
        }
        public async Task DeleteUserAsync(string userId)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
                throw new Exception("User not found");

            var res = await userManager.DeleteAsync(user);
            if (!res.Succeeded)
                throw new Exception(string.Join("; ", res.Errors.Select(e => e.Description)));
        }
        public async Task ChangeUserRoleAsync(AdminUserEditModel model)
        {
            var user = await userManager.Users
                .Include(x => x.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(x => x.Id == model.Id);
            if (model.Roles != null)
            {
                var newRoles = model.Roles
                    .Where(r => !string.IsNullOrWhiteSpace(r))
                    .Select(r => r.Trim())
                    .Distinct()
                    .ToList();


                if (newRoles.Count > 0)
                {
                    var existingRoleNames = await roleManager.Roles.Select(r => r.Name!).ToListAsync();
                    var wrong = newRoles.Except(existingRoleNames).ToList();
                    if (wrong.Count > 0)
                        throw new Exception("Unknown roles: " + string.Join(", ", wrong));
                }

                var currentRoles = await userManager.GetRolesAsync(user);

                var toAdd = newRoles.Except(currentRoles).ToList();
                var toRemove = currentRoles.Except(newRoles).ToList();

                if (toRemove.Count > 0)
                {
                    var removeRes = await userManager.RemoveFromRolesAsync(user, toRemove);
                    if (!removeRes.Succeeded)
                        throw new Exception(string.Join("; ", removeRes.Errors.Select(e => e.Description)));
                }

                if (toAdd.Count > 0)
                {
                    var addRes = await userManager.AddToRolesAsync(user, toAdd);
                    if (!addRes.Succeeded)
                        throw new Exception(string.Join("; ", addRes.Errors.Select(e => e.Description)));
                }
            }
        }


        }
}
