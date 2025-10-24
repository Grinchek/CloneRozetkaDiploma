using AutoMapper;
using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Categories;
using CloneRozetka.Infrastructure.Files;
using CloneRozetka.Infrastructure.Persistence;
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
var imagesPath = Path.Combine(builder.Environment.ContentRootPath, "Images");
builder.Services.AddScoped<IImageService>(_ => new ImageService(imagesPath));


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.MapControllers();
app.Run();
