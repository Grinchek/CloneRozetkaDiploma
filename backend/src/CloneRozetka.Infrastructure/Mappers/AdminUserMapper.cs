using CloneRozetka.Application.Users.DTOs.AdminUser;
using CloneRozetka.Infrastructure.Identity;

namespace CloneRozetka.Infrastructure.Mappers;

public class AdminUserMapper : AutoMapper.Profile
{
    public AdminUserMapper()
    {
        CreateMap<AppUser, AdminUserItemModel>()
         .ForMember(dest => dest.EmailConfirmed, opt => opt.MapFrom(src => src.EmailConfirmed || src.IsEmailVarified))
         .ForMember(dest => dest.IsLoginGoogle, opt => opt.MapFrom(src => src.UserLogins!.Any(l => l.LoginProvider == "Google")))
         .ForMember(dest => dest.IsLoginPassword, opt => opt.MapFrom(src => !string.IsNullOrEmpty(src.PasswordHash)))
         .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => src.UserRoles!.Select(ur => ur.Role.Name).ToList()))
         .ForMember(dest => dest.LoginTypes, opt => opt.Ignore())
         .ForMember(d => d.Image, o => o.MapFrom(s =>
                string.IsNullOrEmpty(s.AvatarUrl) ? "" : $"images/100_{s.AvatarUrl}"
));

    }

}

