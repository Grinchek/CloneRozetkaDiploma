using CloneRozetka.Application.Categories;
using CloneRozetka.Application.Categories.Interfaces;
using CloneRozetka.Application.Categories.Mappers;
using CloneRozetka.Application.Categories.Validators;
using CloneRozetka.Infrastructure;
using CloneRozetka.Infrastructure.Jobs;
using CloneRozetka.Infrastructure.Mappers;
using dotenv.net;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Quartz;


// Load .env file
DotEnv.Load();
var builder = WebApplication.CreateBuilder(args);



var imagesPath = Path.Combine(Directory.GetCurrentDirectory(), "Images");
Directory.CreateDirectory(imagesPath);

// Infrastructure
builder.Services.AddInfrastructure(
    opt => opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")),
    builder.Configuration);

// Application
builder.Services.AddAutoMapper(typeof(ProductMapper).Assembly);
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
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowVite5173");

app.UseCookiePolicy(new CookiePolicyOptions
{
    MinimumSameSitePolicy = SameSiteMode.None,
    Secure = CookieSecurePolicy.Always 
});



app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();



// Static files (Images)
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(imagesPath),
    RequestPath = "/Images"
});

app.MapControllers();
app.Run();

//https://picsum.photos/seed/girl/800/600
