using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

[Table("tblCategories")]
public class CategoryEntity : BaseEntity<int>
{
    [Required, StringLength(255)]
    public string Name { get; set; } = string.Empty;
    [StringLength(200)]
    public string? Image { get; set; }
}