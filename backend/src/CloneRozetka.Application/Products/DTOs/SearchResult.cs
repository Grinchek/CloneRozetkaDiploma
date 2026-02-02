public class SearchResult<T>
{
    public IReadOnlyList<T> Items { get; set; } = [];
    public PaginationModel Pagination { get; set; } = new();
}