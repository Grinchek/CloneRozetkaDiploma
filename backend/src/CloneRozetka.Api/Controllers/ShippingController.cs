using CloneRozetka.Application.Shipping.NovaPoshta;
using Microsoft.AspNetCore.Mvc;

namespace CloneRozetka.Api.Controllers;

[ApiController]
[Route("api/shipping/np")]
public class ShippingController : ControllerBase
{
    private readonly INovaPoshtaService _np;

    public ShippingController(INovaPoshtaService np)
    {
        _np = np;
    }

    [HttpGet("cities")]
    public async Task<ActionResult<IReadOnlyList<NpCityDto>>> GetCities([FromQuery] string? query, CancellationToken ct)
    {
        var list = await _np.SearchCitiesAsync(query ?? "", ct);
        return Ok(list);
    }

    [HttpGet("warehouses")]
    public async Task<ActionResult<IReadOnlyList<NpWarehouseDto>>> GetWarehouses([FromQuery] string? cityRef, CancellationToken ct)
    {
        var list = await _np.GetWarehousesAsync(cityRef ?? "", ct);
        return Ok(list);
    }
}
