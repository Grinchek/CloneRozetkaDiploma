using System.ComponentModel.DataAnnotations.Schema;

namespace CloneRozetka.Domain.Entities;

[Table("tblProductAttributeValues")]
public class ProductAttributeValueEntity
{
    [ForeignKey(nameof(Product))]
    public long ProductId { get; set; }
    public ProductEntity? Product { get; set; }

    [ForeignKey(nameof(Attribute))]
    public int AttributeId { get; set; }
    public AttributeEntity? Attribute { get; set; }

    public string? ValueString { get; set; }
    public decimal? ValueNumber { get; set; }
    public bool? ValueBool { get; set; }

    [ForeignKey(nameof(Option))]
    public int? OptionId { get; set; }
    public AttributeOptionEntity? Option { get; set; }
}
