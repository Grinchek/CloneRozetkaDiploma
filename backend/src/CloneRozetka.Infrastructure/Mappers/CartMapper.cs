using AutoMapper;
using CloneRozetka.Application.Categories.DTOs;
using CloneRozetka.Domain.Entities;

namespace CloneRozetka.Infrastructure.Mappers;

public class CartMapper : Profile
{
    public CartMapper()
    {
        CreateMap<CartItemDTO, CartEntity>();

        CreateMap<CartEntity, CartItemDTO>();
    }
}