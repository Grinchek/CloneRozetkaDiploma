using AutoMapper;
using CloneRozetka.Application.Users.DTOs;
using CloneRozetka.Domain.Entities;

namespace CloneRozetka.Application.Users.Mappers
{
    public class UserMapper : Profile
    {
        public UserMapper()
        {

            CreateMap<GoogleAccountModel, UserDto>()
                .ForMember(dest => dest.FullName,
                    opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}".Trim()))
                .ForMember(dest => dest.AvatarUrl,
                    opt => opt.MapFrom(src => src.Picture))
                .ForMember(dest => dest.Email,
                    opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.GoogleId,
                    opt => opt.MapFrom(src => src.GogoleId)) 
                .ForMember(dest => dest.IsEmailVarified,
                    opt => opt.MapFrom(_ => true)) 
                .ForMember(dest => dest.CreatedAt,
                    opt => opt.MapFrom(_ => DateTime.UtcNow));


            CreateMap<UserDto, User>();
        }
    }
}
