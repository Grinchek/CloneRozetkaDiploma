using CloneRozetka.Application.Categories.DTOs;

namespace CloneRozetka.Application.Categories.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> ListAsync(CancellationToken ct = default);
    Task<CategoryDto?> GetAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(CategoryCreateRequest req, CancellationToken ct = default);
    Task UpdateAsync(CategoryUpdateRequest req, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
