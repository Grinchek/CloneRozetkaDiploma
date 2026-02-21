using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloneRozetka.Domain.Entities;

[Table("tblOrders")]
public class OrderEntity
{
    public long Id { get; set; }

    public int UserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    [StringLength(32)]
    public string Status { get; set; } = "Created";

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalPrice { get; set; }

    [Required]
    [StringLength(64)]
    public string DeliveryProvider { get; set; } = "NovaPoshta";

    [Required]
    [StringLength(200)]
    public string RecipientName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string RecipientPhone { get; set; } = string.Empty;

    [Required]
    [StringLength(36)]
    public string NpCityRef { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string NpCityName { get; set; } = string.Empty;

    [Required]
    [StringLength(36)]
    public string NpWarehouseRef { get; set; } = string.Empty;

    [StringLength(500)]
    public string NpWarehouseName { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Comment { get; set; }

    public virtual ICollection<OrderItemEntity> Items { get; set; } = new List<OrderItemEntity>();
}
