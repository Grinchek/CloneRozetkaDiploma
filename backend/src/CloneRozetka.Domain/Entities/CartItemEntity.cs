using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloneRozetka.Domain.Entities;

[Table("tblCartItems")]
public class CartItemEntity
{
    public long Id { get; set; }

    public int UserId { get; set; }

    public long ProductId { get; set; }
    [ForeignKey(nameof(ProductId))]
    public virtual ProductEntity? Product { get; set; }

    public int Quantity { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
