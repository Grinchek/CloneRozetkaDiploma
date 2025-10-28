using CloneRozetka.Application.Abstractions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace CloneRozetka.Infrastructure.Services;

public class ImageService(IConfiguration configuration) : IImageService
{
    public async Task DeleteImageAsync(string name)
    {
        var sizes = configuration.GetRequiredSection("ImageSizes").Get<List<int>>();
        var dir = Path.Combine(Directory.GetCurrentDirectory(), configuration["ImagesDir"]!);

        Task[] tasks = sizes
            .Select(size => Task.Run(() =>
            {
                var path = Path.Combine(dir, $"{size}_{name}");
                if (File.Exists(path))
                {
                    File.Delete(path);
                }
            }))
            .ToArray();

        await Task.WhenAll(tasks);
    }

    public async Task<string> SaveImageFromUrlAsync(string imageUrl)
    {
        using var client = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(15)
        };
        client.DefaultRequestHeaders.UserAgent.ParseAdd(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36");

        var bytes = await client.GetByteArrayAsync(imageUrl);
        return await SaveImageAsync(bytes);
    }


    public async Task<string> SaveImageAsync(IFormFile file)
    {
        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        var bytes = ms.ToArray();

        return await SaveImageAsync(bytes);
    }

    public async Task<string> SaveImageFromBase64Async(string input)
    {
        var base64Data = input.Contains(",")
            ? input[(input.IndexOf(",") + 1)..]
            : input;

        byte[] imageBytes = Convert.FromBase64String(base64Data);
        return await SaveImageAsync(imageBytes);
    }

    // ---- helpers ----
    private async Task<string> SaveImageAsync(byte[] bytes)
    {
        string imageName = $"{Path.GetRandomFileName()}.webp";
        var sizes = configuration.GetRequiredSection("ImageSizes").Get<List<int>>();

        Task[] tasks = sizes
            .Select(s => SaveOneSizeAsync(bytes, imageName, s))
            .ToArray();

        await Task.WhenAll(tasks);
        return imageName;
    }

    private async Task SaveOneSizeAsync(byte[] bytes, string name, int size)
    {
        var path = Path.Combine(
            Directory.GetCurrentDirectory(),
            configuration["ImagesDir"]!,
            $"{size}_{name}");

        using var image = Image.Load(bytes);

        // ВАЖЛИВО: Mutate — синхронний, без async усередині
        image.Mutate(img =>
        {
            img.Resize(new ResizeOptions
            {
                Size = new Size(size, size),
                Mode = ResizeMode.Max
            });
        });

        await image.SaveAsync(path, new WebpEncoder());
    }
}
