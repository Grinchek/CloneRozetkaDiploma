using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Categories.DTOs;
using CloneRozetka.Domain.Entities;
using FluentValidation;
using Microsoft.AspNetCore.Http;

namespace CloneRozetka.Application.Categories.Validators;

public class CategoryCreateValidator : AbstractValidator<CategoryCreateRequest>
{
    public CategoryCreateValidator(IRepository<CategoryEntity> repo)
    {
        RuleFor(x => x.Name)
            .NotEmpty().MaximumLength(255);

        RuleFor(x => x.Priority)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.UrlSlug)
            .NotEmpty().MaximumLength(255)
            .Matches("^[a-z0-9]+(?:[-_][a-z0-9]+)*$")
            .WithMessage("UrlSlug may contain lowercase letters, digits, '-' or '_'")
            .MustAsync(async (slug, ct) =>
                !await repo.ExistsAsync(
                    repo.Query(asNoTracking: true)
                        .Where(c => !c.IsDeleted && c.UrlSlug == slug),
                    ct))
            .WithMessage("UrlSlug must be unique.");

        RuleFor(x => x.ParentId)
            .MustAsync(async (parentId, ct) =>
            {
                if (parentId is null) return true;
                return await repo.ExistsAsync(
                    repo.Query(asNoTracking: true)
                        .Where(c => c.Id == parentId && !c.IsDeleted),
                    ct);
            })
            .WithMessage("Parent category not found.");

        When(x => x.Image is not null, () =>
        {
            RuleFor(x => x.Image!)
                .Must(IsAllowedContentType)
                .WithMessage("Image must be png/jpg/jpeg/webp.");
        });
    }

    private static bool IsAllowedContentType(IFormFile file) =>
        file.ContentType is "image/png" or "image/jpeg" or "image/jpg" or "image/webp";
}

public class CategoryUpdateValidator : AbstractValidator<CategoryUpdateRequest>
{
    public CategoryUpdateValidator(IRepository<CategoryEntity> repo)
    {
        RuleFor(x => x.Id).GreaterThan(0);

        RuleFor(x => x.Name)
            .NotEmpty().MaximumLength(255);

        RuleFor(x => x.Priority)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.UrlSlug)
            .NotEmpty().MaximumLength(255)
            .Matches("^[a-z0-9]+(?:[-_][a-z0-9]+)*$")
            .WithMessage("UrlSlug may contain lowercase letters, digits, '-' or '_'")
            .MustAsync(async (model, slug, ct) =>
                !await repo.ExistsAsync(
                    repo.Query(asNoTracking: true)
                        .Where(c => !c.IsDeleted && c.UrlSlug == slug && c.Id != model.Id),
                    ct))
            .WithMessage("UrlSlug must be unique.");

        RuleFor(x => x.ParentId)
            .MustAsync(async (model, parentId, ct) =>
            {
                if (parentId is null) return true;
                if (parentId == model.Id) return false;

                return await repo.ExistsAsync(
                    repo.Query(asNoTracking: true)
                        .Where(c => c.Id == parentId && !c.IsDeleted),
                    ct);
            })
            .WithMessage("Parent category not found or invalid.");

        When(x => x.Image is not null, () =>
        {
            RuleFor(x => x.Image!)
                .Must(IsAllowedContentType)
                .WithMessage("Image must be png/jpg/jpeg/webp.");
        });
    }

    private static bool IsAllowedContentType(IFormFile file) =>
        file.ContentType is "image/png" or "image/jpeg" or "image/jpg" or "image/webp";
}
