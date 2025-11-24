using System;
namespace CloneRozetka.Application.Search.Params
{
    /// <summary>
    /// Модель для пошуку користувачів на сайті
    /// </summary>
    public class UserSearchModel
    {
        public List<string>? Roles { get; set; }
        public string? Name { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int Page { get; set; } = 1;
        // Кількість елементів на сторінці
        public int ItemPerPAge { get; set; } = 10;
    }
}
