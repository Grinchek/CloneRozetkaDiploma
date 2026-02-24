using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloneRozetka.Domain.Entities;

[Table("tblAttributes")]
public class AttributeEntity
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [StringLength(200)]
    public string? Slug { get; set; }

    public AttributeDataType DataType { get; set; }

    [StringLength(50)]
    public string? Unit { get; set; }

    public virtual ICollection<CategoryAttributeEntity>? CategoryAttributes { get; set; }
    public virtual ICollection<AttributeOptionEntity>? Options { get; set; }
    public virtual ICollection<ProductAttributeValueEntity>? ProductValues { get; set; }
}
