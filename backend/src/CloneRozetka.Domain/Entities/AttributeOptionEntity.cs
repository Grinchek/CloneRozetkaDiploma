using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloneRozetka.Domain.Entities;

[Table("tblAttributeOptions")]
public class AttributeOptionEntity
{
    [Key]
    public int Id { get; set; }

    [ForeignKey(nameof(Attribute))]
    public int AttributeId { get; set; }
    public AttributeEntity? Attribute { get; set; }

    [Required]
    [StringLength(200)]
    public string Value { get; set; } = string.Empty;
}
