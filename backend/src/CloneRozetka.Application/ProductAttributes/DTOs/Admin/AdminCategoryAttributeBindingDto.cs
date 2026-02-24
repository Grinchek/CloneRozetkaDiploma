namespace CloneRozetka.Application.ProductAttributes.DTOs.Admin;

public record AdminCategoryAttributeBindingDto(
    int AttributeId,
    string AttributeName,
    bool IsRequired,
    int SortOrder,
    bool IsFilterable
);

public record AdminCategoryAttributeBindingUpdateItem(
    int AttributeId,
    bool IsRequired,
    int SortOrder,
    bool IsFilterable
);

public record AdminCategoryAttributeBindingUpdateRequest(
    IReadOnlyList<AdminCategoryAttributeBindingUpdateItem> Bindings
);

/// <summary>Attribute binding inherited from a parent category (read-only in admin).</summary>
public record AdminInheritedAttributeBindingDto(
    int AttributeId,
    string AttributeName,
    bool IsRequired,
    int SortOrder,
    bool IsFilterable,
    int FromCategoryId,
    string FromCategoryName
);

/// <summary>GET response: direct bindings for this category + inherited from parents.</summary>
public record AdminCategoryAttributeBindingsResponse(
    IReadOnlyList<AdminCategoryAttributeBindingDto> Direct,
    IReadOnlyList<AdminInheritedAttributeBindingDto> Inherited
);
