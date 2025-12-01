using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CloneRozetka.Application.Search.Params
{
    public class CategorySearchModel
    {
        public List<string>? OldestCategories  { get; set; }
        public string? Name { get; set; }

        public int Page { get; set; } = 1;

        public int ItemPerPAge { get; set; } = 10;
    }
}
