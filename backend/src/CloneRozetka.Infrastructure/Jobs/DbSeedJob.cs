using CloneRozetka.Application.Abstractions;
using Quartz;

namespace CloneRozetka.Infrastructure.Jobs;

public class DbSeedJob(IDbSeederService dbSeeder) : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        await dbSeeder.SeedData();
    }
}
