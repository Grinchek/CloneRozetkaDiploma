using AutoMapper;
using AutoMapper.QueryableExtensions;
using Core.Interfaces;
using Core.Models.Category;
using Domain;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CloneRozetkaApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CategoriesController(AppDbContext appDbContext,
    IMapper mapper, IImageService imageService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var items = await appDbContext
            .Categories
            .Where(x => !x.IsDeleted)
            .ProjectTo<CategoryItemModel>(mapper.ConfigurationProvider)
            .ToListAsync();
        //.Select(x=>
        //    new CategoryItemModel
        //    {
        //        Id = x.Id,
        //        Name = x.Name,
        //        Image = x.Image ?? ""
        //    });

        return Ok(items); //Статус код 200
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CategoryCreateModel model)
    {
        var entity = mapper.Map<CategoryEntity>(model);

        if (model.Image != null)
        {
            var imageName = await imageService.SaveImageAsync(model.Image);
            entity.Image = imageName;
        }

        appDbContext.Categories.Add(entity);
        await appDbContext.SaveChangesAsync();
        return Ok(); //Статус код 200
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromForm] CategoryUpdateModel model)
    {
        var existing = await appDbContext.Categories
            .Where(x => !x.IsDeleted)
            .SingleOrDefaultAsync(x => x.Id == model.Id);

        if (existing == null)
            return NotFound(); //Статус код 404

        mapper.Map(model, existing);

        if (model.Image != null)
        {
            var imageNameDelete = existing.Image;
            if (!string.IsNullOrEmpty(imageNameDelete))
            {
                await imageService.DeleteImageAsync(imageNameDelete);
            }
            var imageName = await imageService.SaveImageAsync(model.Image);
            existing.Image = imageName;
        }
        await appDbContext.SaveChangesAsync();
        return Ok(); //Статус код 200
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var entity = await appDbContext.Categories
            .Where(x => !x.IsDeleted)
            .ProjectTo<CategoryItemModel>(mapper.ConfigurationProvider)
            .SingleOrDefaultAsync(x => x.Id == id);
        if (entity == null)
        {
            return NotFound(); //Статус код 404
        }
        return Ok(entity); //Статус код 200
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await appDbContext.Categories
            .Where(x => !x.IsDeleted)
            .SingleOrDefaultAsync(x => x.Id == id);
        if (entity == null)
        {
            return NotFound(); //Статус код 404
        }
        entity.IsDeleted = true;
        await appDbContext.SaveChangesAsync();
        return Ok(); //Статус код 200
    }
}