using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloneRozetka.Domain.Entities;

[Table("tblProducts")]
public class ProductEntity : BaseEntity<long>
{
    [StringLength(250)]
    public string Name { get; set; } = String.Empty;

    [StringLength(250)]
    public string Slug { get; set; } = String.Empty;

    public decimal Price { get; set; }

    [StringLength(10000)]
    public string? Description { get; set; }

    [ForeignKey("Category")]
    public long CategoryId { get; set; }

    public CategoryEntity? Category { get; set; }


    public ICollection<ProductImageEntity>? ProductImages { get; set; }
}