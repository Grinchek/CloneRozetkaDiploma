using AutoMapper;
using CloneRozetka.Application.Categories.DTOs;
using CloneRozetka.Domain.Entities;

namespace CloneRozetka.Application.Categories.Mappers;

public class CategoryProfile : Profile
{
    public CategoryProfile()
    {
        // Category -> CategoryDto
        CreateMap<CategoryEntity, CategoryDto>();

        // CategoryCreateRequest -> Category
        CreateMap<CategoryCreateRequest, CategoryEntity>()
            .ForMember(d => d.Image, o => o.Ignore())
            .ForMember(d => d.IsDeleted, o => o.Ignore())
            .ForMember(d => d.Parent, o => o.Ignore());

        // CategoryUpdateRequest -> Category
        CreateMap<CategoryUpdateRequest, CategoryEntity>()
            .ForMember(d => d.Image, o => o.Ignore())
            .ForMember(d => d.Parent, o => o.Ignore());
    }
}
