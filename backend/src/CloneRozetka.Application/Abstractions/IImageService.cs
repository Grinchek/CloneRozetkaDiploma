using Microsoft.AspNetCore.Http;

namespace CloneRozetka.Application.Abstractions;

public interface IImageService
{
    Task<string> SaveImageAsync(IFormFile file);
    Task<string> SaveImageFromUrlAsync(string imageUrl);
    Task<string> SaveImageFromBase64Async(string input);
    Task DeleteImageAsync(string name);
}
