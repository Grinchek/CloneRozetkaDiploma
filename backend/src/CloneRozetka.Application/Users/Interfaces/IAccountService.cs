using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CloneRozetka.Application.Users.Interfaces;

public interface IAccountService
{
    public Task<string> LoginByGoogle(string token);
}
