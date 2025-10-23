using CloneRozetka.Application.Abstractions;
using Microsoft.AspNetCore.Http;

namespace CloneRozetka.Infrastructure.Files;

public class ImageService : IImageService
{
    private readonly string _imagesDir;

    public ImageService(string rootPath)
    {
        _imagesDir = Path.Combine(rootPath, "Images");
        Directory.CreateDirectory(_imagesDir);
    }

    public async Task<string> SaveImageAsync(IFormFile file, CancellationToken ct = default)
    {
        var name = $"{Guid.NewGuid():N}{Path.GetExtension(file.FileName)}";
        var path = Path.Combine(_imagesDir, name);
        await using var fs = new FileStream(path, FileMode.CreateNew);
        await file.CopyToAsync(fs, ct);
        return name;
    }

    public Task DeleteImageAsync(string name)
    {
        var path = Path.Combine(_imagesDir, name);
        if (File.Exists(path)) File.Delete(path);
        return Task.CompletedTask;
    }
}
