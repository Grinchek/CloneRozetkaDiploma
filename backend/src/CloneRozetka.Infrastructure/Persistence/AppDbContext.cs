using CloneRozetka.Domain.Entities;
using CloneRozetka.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CloneRozetka.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<AppUser, AppRole, int,
        IdentityUserClaim<int>, AppUserRole, AppUserLogin,
        IdentityRoleClaim<int>, IdentityUserToken<int>>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<CategoryEntity> Categories => Set<CategoryEntity>();
    public DbSet<ProductEntity> Products => Set<ProductEntity>();
    public DbSet<ProductImageEntity> ProductImages => Set<ProductImageEntity>();
    public DbSet<CartEntity> Carts => Set<CartEntity>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);
        b.Entity<CategoryEntity>(e =>
        {
            e.ToTable("tblCategories");
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(255).IsRequired();
            e.Property(x => x.Image).HasMaxLength(255);
            e.Property(x => x.IsDeleted).HasDefaultValue(false);
        });

        b.Entity<AppUserRole>(ur =>
        {
            ur.HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(r => r.RoleId)
                .IsRequired();

            ur.HasOne(ur => ur.User)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(u => u.UserId)
                .IsRequired();
        });

        b.Entity<AppUserLogin>(b =>
        {
            b.HasOne(l => l.User)
                .WithMany(u => u.UserLogins)
                .HasForeignKey(l => l.UserId)
                .IsRequired();
        });

        b.Entity<CartEntity>(e =>
        {
            e.ToTable("tblCarts");

            e.HasKey(c => new { c.UserId, c.ProductId });

            e.Property(c => c.Quantity).HasDefaultValue(1);

            e.HasOne(c => c.Product)
                .WithMany()
                .HasForeignKey(c => c.ProductId)
                .IsRequired();

            e.HasOne<AppUser>()
                .WithMany() 
                .HasForeignKey(c => c.UserId)
                .IsRequired();
        });
    }
}
