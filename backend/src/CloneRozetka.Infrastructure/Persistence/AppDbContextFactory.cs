using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace CloneRozetka.Infrastructure.Persistence
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var basePath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "CloneRozetka.Api"));

            var builder = new ConfigurationBuilder()
                .AddJsonFile(Path.Combine(basePath, "appsettings.json"), optional: false, reloadOnChange: false)
                .AddJsonFile(Path.Combine(basePath, "appsettings.Development.json"), optional: true, reloadOnChange: false)
                .AddEnvironmentVariables();

            var config = builder.Build();
            var connStr = config.GetConnectionString("Default");

            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseNpgsql(connStr)
                .Options;

            return new AppDbContext(options);
        }
    }
}
