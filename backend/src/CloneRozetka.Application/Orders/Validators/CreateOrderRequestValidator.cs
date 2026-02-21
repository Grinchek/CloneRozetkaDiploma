using CloneRozetka.Application.Orders.DTOs;
using FluentValidation;

namespace CloneRozetka.Application.Orders.Validators;

public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.RecipientName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.RecipientPhone).NotEmpty().MaximumLength(50);
        RuleFor(x => x.NpCityRef).NotEmpty().MaximumLength(36);
        RuleFor(x => x.NpCityName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.NpWarehouseRef).NotEmpty().MaximumLength(36);
        RuleFor(x => x.NpWarehouseName).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Comment).MaximumLength(1000).When(x => x.Comment != null);
    }
}
