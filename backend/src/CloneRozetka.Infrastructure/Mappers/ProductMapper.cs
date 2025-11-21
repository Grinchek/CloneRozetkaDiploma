using AutoMapper;
using CloneRozetka.Application.Products.DTOs;
using CloneRozetka.Domain.Entities;

namespace CloneRozetka.Infrastructure.Mappers;

public class ProductMapper : Profile
{
    public ProductMapper()
    {
        CreateMap<ProductEntity, ProductListItemDto>()
            .ForMember(dest => dest.MainImageUrl, opt => opt
                .MapFrom(x => x.ProductImages
                    .OrderBy(pi => pi.Priority)
                    .Select(x =>$"/images/400_{x.Name}").FirstOrDefault()));
        ;
    }
}
