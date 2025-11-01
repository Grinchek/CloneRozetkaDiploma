using CloneRozetka.Application.Categories;
using CloneRozetka.Application.Categories.Interfaces;
using CloneRozetka.Application.Categories.Mappers;
using CloneRozetka.Application.Categories.Validators;
using CloneRozetka.Infrastructure;
using CloneRozetka.Infrastructure.Jobs;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Quartz;

var builder = WebApplication.CreateBuilder(args);

var imagesPath = Path.Combine(Directory.GetCurrentDirectory(), "Images");
Directory.CreateDirectory(imagesPath);

// Infrastructure
builder.Services.AddInfrastructure(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// Application
builder.Services.AddAutoMapper(typeof(CategoryProfile).Assembly);
builder.Services.AddValidatorsFromAssemblyContaining<CategoryCreateValidator>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

// Quartz 
builder.Services.AddQuartz(q =>
{
    var jobKey = new JobKey(nameof(DbSeedJob));
    q.AddJob<DbSeedJob>(opts => opts.WithIdentity(jobKey));
    q.AddTrigger(opts => opts
        .ForJob(jobKey)
        .WithIdentity($"{nameof(DbSeedJob)}-trigger")
        .StartNow());
});
builder.Services.AddQuartzHostedService(opt => { opt.WaitForJobsToComplete = true; });

// CORS / MVC / Swagger
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

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowVite5173");


// app.UseAuthentication();
// app.UseAuthorization();

app.UseHttpsRedirection();

// Static files (Images)
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(imagesPath),
    RequestPath = "/Images"
});

app.MapControllers();
app.Run();
