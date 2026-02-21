using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloneRozetka.Domain.Entities;

[Table("tblOrderItems")]
public class OrderItemEntity
{
    public long Id { get; set; }

    public long OrderId { get; set; }
    [ForeignKey(nameof(OrderId))]
    public virtual OrderEntity? Order { get; set; }

    public long ProductId { get; set; }
    [ForeignKey(nameof(ProductId))]
    public virtual ProductEntity? Product { get; set; }

    [Required]
    [StringLength(250)]
    public string ProductName { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    public int Quantity { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal LineTotal { get; set; }
}
