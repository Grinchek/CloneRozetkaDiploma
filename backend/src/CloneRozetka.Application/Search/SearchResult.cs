namespace CloneRozetka.Application.Search
{
    public class SearchResult<T>
    {
        /// <summary>
        /// Список елементів пошукової видачі
        /// </summary>
        public List<T> Items { get; set; } = new List<T>();
        /// <summary>
        /// Інформація для пагінації пошукової видачі
        /// </summary>
        public PaginationModel Pagination { get; set; } = new PaginationModel();
    }
}
