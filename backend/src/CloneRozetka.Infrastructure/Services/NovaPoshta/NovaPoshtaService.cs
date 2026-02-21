using System.Text.Json;
using CloneRozetka.Application.Shipping.NovaPoshta;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace CloneRozetka.Infrastructure.Services.NovaPoshta;

public class NovaPoshtaService : INovaPoshtaService
{
    private const string ApiUrl = "https://api.novaposhta.ua/v2.0/json/";
    public static readonly string HttpClientName = "NovaPoshta";
    private readonly IHttpClientFactory _httpFactory;
    private readonly IMemoryCache _cache;
    private readonly string _apiKey;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(20);

    public NovaPoshtaService(IHttpClientFactory httpFactory, IMemoryCache cache, IOptions<NovaPoshtaOptions> options)
    {
        _httpFactory = httpFactory;
        _cache = cache;
        _apiKey = options.Value.ApiKey ?? throw new InvalidOperationException("NovaPoshta:ApiKey is not configured.");
    }

    public async Task<IReadOnlyList<NpCityDto>> SearchCitiesAsync(string query, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            return Array.Empty<NpCityDto>();

        var cacheKey = $"np:cities:{query.Trim().ToLowerInvariant()}";
        if (_cache.TryGetValue(cacheKey, out IReadOnlyList<NpCityDto>? cached))
            return cached ?? Array.Empty<NpCityDto>();

        var body = new
        {
            apiKey = _apiKey,
            modelName = "Address",
            calledMethod = "getCities",
            methodProperties = new { FindByString = query.Trim(), Limit = 30 }
        };
        var json = JsonSerializer.Serialize(body);
        var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
        var http = _httpFactory.CreateClient(HttpClientName);
        var response = await http.PostAsync(ApiUrl, content, ct);
        response.EnsureSuccessStatusCode();
        var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);
        var list = new List<NpCityDto>();
        if (doc.RootElement.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Array)
            foreach (var item in data.EnumerateArray())
            {
                var refVal = item.TryGetProperty("Ref", out var r) ? r.GetString() ?? "" : "";
                var name = item.TryGetProperty("Description", out var d) ? d.GetString() ?? "" : item.TryGetProperty("DescriptionRu", out var dr) ? dr.GetString() ?? "" : "";
                if (!string.IsNullOrEmpty(refVal) && !string.IsNullOrEmpty(name))
                    list.Add(new NpCityDto { Ref = refVal, Name = name });
            }
        _cache.Set(cacheKey, list, CacheDuration);
        return list;
    }

    public async Task<IReadOnlyList<NpWarehouseDto>> GetWarehousesAsync(string cityRef, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(cityRef))
            return Array.Empty<NpWarehouseDto>();

        var cacheKey = $"np:warehouses:{cityRef}";
        if (_cache.TryGetValue(cacheKey, out IReadOnlyList<NpWarehouseDto>? cached))
            return cached ?? Array.Empty<NpWarehouseDto>();

        var body = new
        {
            apiKey = _apiKey,
            modelName = "Address",
            calledMethod = "getWarehouses",
            methodProperties = new { CityRef = cityRef }
        };
        var json = JsonSerializer.Serialize(body);
        var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
        var http = _httpFactory.CreateClient(HttpClientName);
        var response = await http.PostAsync(ApiUrl, content, ct);
        response.EnsureSuccessStatusCode();
        var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);
        var list = new List<NpWarehouseDto>();
        if (doc.RootElement.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Array)
            foreach (var item in data.EnumerateArray())
            {
                var refVal = item.TryGetProperty("Ref", out var r) ? r.GetString() ?? "" : "";
                var name = item.TryGetProperty("Description", out var d) ? d.GetString() ?? "" : "";
                var number = item.TryGetProperty("Number", out var n) ? n.GetString() : null;
                if (!string.IsNullOrEmpty(refVal))
                    list.Add(new NpWarehouseDto { Ref = refVal, Name = name ?? "", Number = number });
            }
        _cache.Set(cacheKey, list, CacheDuration);
        return list;
    }
}

public class NovaPoshtaOptions
{
    public const string SectionName = "NovaPoshta";
    public string? ApiKey { get; set; }
}
