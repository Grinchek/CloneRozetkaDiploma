using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CloneRozetka.Infrastructure.Persistence.Seed.Products
{
    public sealed class ProductSeedModel
    {
        public string Name { get; set; } = default!;
        public string? Slug { get; set; }
        public decimal Price { get; set; } 
        public string? Description { get; set; }
        public int CategoryId { get; set; }

    }
}
