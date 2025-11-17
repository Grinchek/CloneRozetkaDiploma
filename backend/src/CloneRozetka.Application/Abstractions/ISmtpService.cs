using CloneRozetka.Application;
using System.Net.Mail;

namespace CloneRozetka.Application;

public interface ISmtpService
{
    Task<bool> SendEmailAsync(EmailMessage message);
}