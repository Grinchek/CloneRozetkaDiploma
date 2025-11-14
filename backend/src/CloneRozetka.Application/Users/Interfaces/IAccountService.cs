using CloneRozetka.Application.Users.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CloneRozetka.Application.Users.Interfaces;

public interface IAccountService
{
    public Task<string> LoginByGoogle(string token);
    public Task<bool> ForgotPasswordAsync(ForgotPasswordModel model);
    public Task<bool> ValidateResetTokenAsync(ValidateResetTokenModel model);
    public Task ResetPasswordAsync(ResetPasswordModel model);
}
