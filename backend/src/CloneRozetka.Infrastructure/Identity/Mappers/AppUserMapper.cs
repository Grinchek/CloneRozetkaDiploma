using AutoMapper;
using CloneRozetka.Infrastructure.Identity;
using CloneRozetka.Domain.Entities;
using CloneRozetka.Application.Users.DTOs;

namespace CloneRozetka.Infrastructure.Identity.Mappers
{
    public class AppUserMapper : Profile
    {
        public AppUserMapper()
        {
            CreateMap<User, AppUser>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.AvatarUrl))
                .ForMember(dest => dest.GoogleId, opt => opt.MapFrom(src => src.GoogleId))
                .ForMember(dest => dest.IsEmailVarified, opt => opt.MapFrom(src => src.IsEmailVarified))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));


            CreateMap<AppUser, User>();
        }
    }
}
