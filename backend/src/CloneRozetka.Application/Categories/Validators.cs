using FluentValidation;

namespace CloneRozetka.Application.Categories;

public class CategoryCreateValidator : AbstractValidator<CategoryCreateRequest>
{
    public CategoryCreateValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Image).NotNull();
    }
}

public class CategoryUpdateValidator : AbstractValidator<CategoryUpdateRequest>
{
    public CategoryUpdateValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
    }
}
