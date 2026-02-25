namespace CloneRozetka.Application.Compare.DTOs;

public class CompareSpecItemDto
{
    public int AttributeId { get; set; }
    public string AttributeName { get; set; } = default!;
    public int SortOrder { get; set; }
    public string DisplayValue { get; set; } = default!;
}
