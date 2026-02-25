using CloneRozetka.Application.Users.DTOs.Account;

namespace CloneRozetka.Application.Users.Interfaces;

public interface IAccountService
{
    Task<string> LoginByGoogle(string token);
    Task<bool> ForgotPasswordAsync(ForgotPasswordModel model);
    Task<bool> ValidateResetTokenAsync(ValidateResetTokenModel model);
    Task ResetPasswordAsync(ResetPasswordModel model);

    Task<UserProfileDto?> GetProfileAsync(int userId);
    Task<UserProfileDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request);
    Task<(bool Succeeded, IReadOnlyList<string> Errors)> ChangePasswordAsync(int userId, ChangePasswordRequest request);
    Task<bool> ConfirmEmailAsync(int userId, string token);
    Task<bool> ResendConfirmationEmailAsync(int userId);
    /// <summary>Returns (success, errorMessage). When success is false, errorMessage is the reason.</summary>
    Task<(bool Success, string? ErrorMessage)> TryResendConfirmationEmailAsync(int userId);
}
