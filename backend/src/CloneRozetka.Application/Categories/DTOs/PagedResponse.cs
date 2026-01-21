using CloneRozetka.Application.Search;

namespace CloneRozetka.Application.Categories.DTOs
{
    public class PagedResponse<T>
    {
        public IReadOnlyList<T> Items { get; set; } = [];
        public PaginationModel Pagination { get; set; } = new();
    }
}
