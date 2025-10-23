using Microsoft.AspNetCore.Http;

namespace CloneRozetka.Application.Abstractions;

public interface IImageService
{
    Task<string> SaveImageAsync(IFormFile file, CancellationToken ct = default);
    Task DeleteImageAsync(string name);
}
