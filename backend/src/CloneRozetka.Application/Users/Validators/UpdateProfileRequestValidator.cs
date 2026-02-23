using CloneRozetka.Application.Users.DTOs.Account;
using FluentValidation;

namespace CloneRozetka.Application.Users.Validators;

public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(x => x.FullName).MaximumLength(200).When(x => x.FullName != null);
        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20)
            .Matches(@"^[\d\s\+\-\(\)]*$")
            .When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber));
    }
}
