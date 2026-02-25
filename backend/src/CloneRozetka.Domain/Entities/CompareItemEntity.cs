using System.ComponentModel.DataAnnotations.Schema;

namespace CloneRozetka.Domain.Entities;

[Table("tblCompareItems")]
public class CompareItemEntity
{
    public long Id { get; set; }

    public int UserId { get; set; }

    public long ProductId { get; set; }

    [ForeignKey(nameof(ProductId))]
    public virtual ProductEntity? Product { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
