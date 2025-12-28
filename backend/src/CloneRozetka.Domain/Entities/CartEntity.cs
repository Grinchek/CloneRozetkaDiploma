using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CloneRozetka.Domain.Entities
{
    public class CartEntity
    {
        [ForeignKey("Product")]
        public long ProductId { get; set; }

        public int UserId { get; set; }

        [Range(0, 50)]
        public int Quantity { get; set; }

        public virtual ProductEntity? Product { get; set; }
    }
}
