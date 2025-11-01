﻿// Domain: CloneRozetka.Infrastructure/Identity/AppRole.cs
using Microsoft.AspNetCore.Identity;

namespace CloneRozetka.Infrastructure.Identity
{
    public class AppRole: IdentityRole<int>
    {
        public string? Description { get; set; }
    }
}
