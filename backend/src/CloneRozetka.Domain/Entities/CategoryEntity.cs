using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloneRozetka.Domain.Entities;

public class CategoryEntity
{
    public int Id { get; set; }
    [StringLength(200)]
    public string Name { get; set; } = default!;
    public int Priority { get; set; }
    [StringLength(255)]
    public string UrlSlug { get; set; } = string.Empty;

    [StringLength(255)]
    public string? Image { get; set; }
    public bool IsDeleted { get; set; }
    [ForeignKey(nameof(Parent))]
    public int? ParentId { get; set; }
    public CategoryEntity? Parent { get; set; }

    public virtual ICollection<CategoryEntity>? Children { get; set; }
    public virtual ICollection<ProductEntity>? Products { get; set; }



}
