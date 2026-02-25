using CloneRozetka.Application;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace CloneRozetka.Infrastructure.Services;

public class SmtpService : ISmtpService
{
    private readonly IConfiguration _configuration;

    public SmtpService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<bool> SendEmailAsync(EmailMessage message)
    {
        var host = _configuration["Smtp:Host"] ?? EmailConfiguration.SmtpServer;
        var port = _configuration.GetValue<int?>("Smtp:Port") ?? EmailConfiguration.Port;
        var userName = _configuration["Smtp:Username"] ?? EmailConfiguration.UserName;
        var password = _configuration["Smtp:Password"] ?? EmailConfiguration.Password;
        var from = _configuration["Smtp:From"] ?? userName ?? EmailConfiguration.From;

        if (string.IsNullOrEmpty(userName) || string.IsNullOrEmpty(password))
            return false;

        var body = new TextPart("html") { Text = message.Body };
        var multipart = new Multipart("mixed");
        multipart.Add(body);

        var emailMessage = new MimeMessage();
        emailMessage.From.Add(new MailboxAddress(from, from));
        emailMessage.To.Add(MailboxAddress.Parse(message.To));
        emailMessage.Subject = message.Subject;
        emailMessage.Body = multipart;

        using var client = new SmtpClient();
        try
        {
            var useSsl = port == 465;
            var options = useSsl ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
            await client.ConnectAsync(host, port, options);
            await client.AuthenticateAsync(userName, password);
            await client.SendAsync(emailMessage);
            await client.DisconnectAsync(true);
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine("[SMTP] Помилка відправки листа: {0}", ex.Message);
            if (ex.InnerException != null)
                Console.WriteLine("[SMTP] Inner: {0}", ex.InnerException.Message);
            Console.WriteLine("[SMTP] Stack: {0}", ex.StackTrace);
        }
        return false;
    }
}