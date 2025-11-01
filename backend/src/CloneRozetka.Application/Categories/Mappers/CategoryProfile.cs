using AutoMapper;
using CloneRozetka.Application.Categories.DTOs;
using CloneRozetka.Domain.Entities;

namespace CloneRozetka.Application.Categories.Mappers;

public class CategoryProfile : Profile
{
    public CategoryProfile()
    {
        // Category -> CategoryDto
        CreateMap<Category, CategoryDto>();

        // CategoryCreateRequest -> Category
        CreateMap<CategoryCreateRequest, Category>()
            .ForMember(d => d.Image, o => o.Ignore())
            .ForMember(d => d.IsDeleted, o => o.Ignore())
            
            .ForMember(d => d.Parent, o => o.Ignore());

        // CategoryUpdateRequest -> Category
        CreateMap<CategoryUpdateRequest, Category>()
            .ForMember(d => d.Image, o => o.Ignore())
         
            .ForMember(d => d.Parent, o => o.Ignore());
    }
}
