namespace CloneRozetka.Application.Shipping.NovaPoshta;

public interface INovaPoshtaService
{
    Task<IReadOnlyList<NpCityDto>> SearchCitiesAsync(string query, CancellationToken ct = default);
    Task<IReadOnlyList<NpWarehouseDto>> GetWarehousesAsync(string cityRef, CancellationToken ct = default);
}

public class NpCityDto
{
    public string Ref { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class NpWarehouseDto
{
    public string Ref { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Number { get; set; }
}
