using System.ComponentModel.DataAnnotations.Schema;

namespace CloneRozetka.Domain.Entities;

[Table("tblCategoryAttributes")]
public class CategoryAttributeEntity
{
    [ForeignKey(nameof(Category))]
    public int CategoryId { get; set; }
    public CategoryEntity? Category { get; set; }

    [ForeignKey(nameof(Attribute))]
    public int AttributeId { get; set; }
    public AttributeEntity? Attribute { get; set; }

    public bool IsRequired { get; set; }
    public int SortOrder { get; set; }
    public bool IsFilterable { get; set; }
}
