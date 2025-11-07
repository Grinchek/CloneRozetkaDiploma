using AutoMapper;
using CloneRozetka.Application.Users.DTOs;
using CloneRozetka.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CloneRozetka.Application.Users.Mappers;

public class UserMapper : Profile
{
    public UserMapper()
    {
        CreateMap<GoogleAccountModel, AppUser>()
                .ForMember(x => x.AvatarUrl, opt => opt.Ignore())
                .ForMember(x => x.UserName, opt => opt.MapFrom(x => x.Email));

    }
}