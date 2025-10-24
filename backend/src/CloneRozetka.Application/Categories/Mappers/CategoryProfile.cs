using AutoMapper;
using CloneRozetka.Application.Categories.DTOs;
using CloneRozetka.Domain.Entities;

namespace CloneRozetka.Application.Categories.Mappers;

public class CategoryProfile : Profile
{
    public CategoryProfile()
    {
        CreateMap<Category, CategoryDto>();

        CreateMap<CategoryCreateRequest, Category>()
            .ForMember(d => d.Image, o => o.Ignore())
            .ForMember(d => d.IsDeleted, o => o.Ignore());
        CreateMap<CategoryUpdateRequest, Category>()
            .ForMember(d => d.Image, o => o.Ignore());
    }
}
