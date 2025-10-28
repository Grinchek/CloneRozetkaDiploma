using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Categories; 
using CloneRozetka.Application.Categories.Mappers;
using CloneRozetka.Application.Categories.Validators;
using CloneRozetka.Infrastructure.Services;
using CloneRozetka.Infrastructure.Persistence;
using CloneRozetka.Infrastructure.Persistence.Seed;
using CloneRozetka.Infrastructure.Repositories;
using FluentValidation;
using Microsoft.EntityFrameworkCore;



var builder = WebApplication.CreateBuilder(args);



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


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var app = builder.Build();
// Seeder
using (var scope = app.Services.CreateScope())
{
    await app.Services.SeedCategoriesAsync(Path.Combine("Files", "SeederFiles", "categories.json"));
}
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.MapControllers();
app.Run();
