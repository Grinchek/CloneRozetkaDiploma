using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Categories;
using CloneRozetka.Application.Categories.Mappers;
using CloneRozetka.Application.Categories.Validators;
using CloneRozetka.Infrastructure.Persistence;
using CloneRozetka.Infrastructure.Persistence.Seed;
using CloneRozetka.Infrastructure.Repositories;
using CloneRozetka.Infrastructure.Services;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Quartz;
using CloneRozetka.Infrastructure.Jobs;
using CloneRozetka.Application.Categories.Interfaces;



var builder = WebApplication.CreateBuilder(args);
var imagesPath = Path.Combine(Directory.GetCurrentDirectory(), "Images");
Directory.CreateDirectory(imagesPath);



//// DB (Postgres)
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// Application
builder.Services.AddAutoMapper(typeof(CategoryProfile).Assembly);
builder.Services.AddValidatorsFromAssemblyContaining<CategoryCreateValidator>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

// Infrastructure
builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
builder.Services.AddScoped<IImageService, ImageService>();

builder.Services.AddScoped<IDbSeederService, DbSeederService>();


builder.Services.AddQuartz(q => {
    var jobKey = new JobKey(nameof(DbSeedJob));
    q.AddJob<DbSeedJob>(opts => opts.WithIdentity(jobKey));

    q.AddTrigger(opts => opts
        .ForJob(jobKey)
        .WithIdentity($"{nameof(DbSeedJob)}-trigger")
        .StartNow());
});

builder.Services.AddQuartzHostedService(opt =>
{
    opt.WaitForJobsToComplete = true;
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVite5173", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();

    });
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var app = builder.Build();
// Apply Migrations
//await app.ApplyMigrationsAsync();
// Seeder
//await app.Services.SeedCategoriesAsync(Path.Combine("Files", "SeederFiles", "categories.json"));

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowVite5173");

app.UseHttpsRedirection();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(imagesPath),
    RequestPath = "/Images"
});

app.MapControllers();
app.Run();