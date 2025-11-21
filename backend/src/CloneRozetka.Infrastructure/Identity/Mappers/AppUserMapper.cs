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
            CreateMap<User, AppUser>();


            CreateMap<AppUser, User>();
        }
    }
}
