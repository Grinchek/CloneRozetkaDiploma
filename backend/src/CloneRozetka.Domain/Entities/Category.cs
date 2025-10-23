namespace CloneRozetka.Domain.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Image { get; set; }
    public bool IsDeleted { get; set; }
}
