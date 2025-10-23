using CloneRozetka.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CloneRozetka.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Category>(e =>
        {
            e.ToTable("tblCategories");
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(255).IsRequired();
            e.Property(x => x.Image).HasMaxLength(255);
            e.Property(x => x.IsDeleted).HasDefaultValue(false);
        });
    }
}
