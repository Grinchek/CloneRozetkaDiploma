using CloneRozetka.Application.Categories.DTOs;
using CloneRozetka.Application.Search;
using CloneRozetka.Application.Search.Params;
using CloneRozetka.Application.Users.DTOs.AdminUser;

namespace CloneRozetka.Application.Categories.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> ListAsync();
    Task<CategoryDto?> GetAsync(int id);
    Task<int> CreateAsync(CategoryCreateRequest req);
    Task UpdateAsync(CategoryUpdateRequest req);
    Task DeleteAsync(int id);
    Task<SearchResult<CategoryDto>> SearchCategoriesAsync(CategorySearchModel model);
}
