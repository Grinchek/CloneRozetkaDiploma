using AutoMapper;
using AutoMapper.QueryableExtensions;
using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Products.DTOs;
using CloneRozetka.Domain.Entities;
using CloneRozetka.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CloneRozetka.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController(AppDbContext _db, 
        IImageService _imageService,
        IMapper _mapper) : ControllerBase
    {
        //private readonly AppDbContext _db;
        //private readonly IImageService _imageService;

        //public ProductsController(AppDbContext db, IImageService imageService)
        //{
        //    _db = db;
        //    _imageService = imageService;
        //}

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductListItemDto>>> GetAll()
        {
            //var items = await _db.Products
            //    .Include(p => p.ProductImages)
            //    .AsNoTracking()
            //    .ToListAsync();

            //var result = items.Select(p =>
            //{
            //    var mainImage = p.ProductImages?
            //        .OrderBy(i => i.Priority)
            //        .FirstOrDefault();

            //    return new ProductListItemDto
            //    {
            //        Id = p.Id,
            //        Name = p.Name,
            //        Slug = p.Slug!,
            //        Price = p.Price,
            //        CategoryId = p.CategoryId,
            //        MainImageUrl = mainImage is null
            //            ? null
            //            : $"/Images/400_{mainImage.Name}" 
            //    };
            //});

            var result = await _db.Products
                .ProjectTo<ProductListItemDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return Ok(result);
        }

        // GET: api/products/5
        [HttpGet("{id:long}")]
        public async Task<ActionResult<ProductDetailsDto>> Get(long id)
        {
            var product = await _db.Products
                .Include(p => p.ProductImages)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product is null)
                return NotFound();

            var dto = new ProductDetailsDto
            {
                Id = product.Id,
                Name = product.Name,
                Slug = product.Slug!,
                Price = product.Price,
                Description = product.Description,
                CategoryId = product.CategoryId,
                ImageUrls = product.ProductImages?
                    .OrderBy(i => i.Priority)
                    .Select(i => $"/Images/400_{i.Name}") 
                    .ToList() ?? new List<string>()
            };

            return Ok(dto);
        }

        // POST: api/products
       
        [HttpPost]
        // [Authorize(Roles = "Admin")]
        [RequestSizeLimit(20_000_000)] 
        public async Task<ActionResult<ProductDetailsDto>> Create(
            [FromForm] ProductCreateRequest request)
        {
            // 1. Створюємо продукт
            var product = new ProductEntity
            {
                Name = request.Name,
                Slug = request.Slug,
                Price = request.Price,
                Description = request.Description,
                CategoryId = request.CategoryId,
                IsDeleted = false
            };

            await _db.Products.AddAsync(product);
            await _db.SaveChangesAsync(); 

           
            var images = new List<ProductImageEntity>();

            if (request.Images is not null && request.Images.Count > 0)
            {
                short priority = 1;

                foreach (var file in request.Images)
                {
                    if (file.Length == 0)
                        continue;

                   
                    var imageName = await _imageService.SaveImageAsync(file);

                    images.Add(new ProductImageEntity
                    {
                        Name = imageName,
                        Priority = priority++,
                        ProductId = product.Id
                    });
                }

                if (images.Count > 0)
                {
                    await _db.ProductImages.AddRangeAsync(images);
                    await _db.SaveChangesAsync();
                }
            }

           
            var dto = new ProductDetailsDto
            {
                Id = product.Id,
                Name = product.Name,
                Slug = product.Slug!,
                Price = product.Price,
                Description = product.Description,
                CategoryId = product.CategoryId,
                ImageUrls = images
                    .OrderBy(i => i.Priority)
                    .Select(i => $"/Images/400_{i.Name}")
                    .ToList()
            };

            return CreatedAtAction(nameof(Get), new { id = product.Id }, dto);
        }

        // PUT: api/products/5
        [HttpPut("{id:long}")]
        // [Authorize(Roles = "Admin")]
        [RequestSizeLimit(20_000_000)]
        public async Task<IActionResult> Update(
            long id,
            [FromForm] ProductUpdateRequest request)
        {
            var product = await _db.Products
                .Include(p => p.ProductImages)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product is null)
                return NotFound();

            product.Name = request.Name;
            product.Slug = request.Slug;
            product.Price = request.Price;
            product.Description = request.Description;
            product.CategoryId = request.CategoryId;

         
            if (request.NewImages is not null && request.NewImages.Count > 0)
            {
                short priorityStart = (short)((product.ProductImages?.Max(i => i.Priority) ?? 0) + 1);
                var newImages = new List<ProductImageEntity>();

                foreach (var file in request.NewImages)
                {
                    if (file.Length == 0)
                        continue;

                    var imageName = await _imageService.SaveImageAsync(file);

                    newImages.Add(new ProductImageEntity
                    {
                        Name = imageName,
                        Priority = priorityStart++,
                        ProductId = product.Id
                    });
                }

                if (newImages.Count > 0)
                    await _db.ProductImages.AddRangeAsync(newImages);
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/products/5
        [HttpDelete("{id:long}")]
        // [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(long id)
        {
            var product = await _db.Products
                .Include(p => p.ProductImages)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product is null)
                return NotFound();

          
            if (product.ProductImages is not null && product.ProductImages.Count > 0)
            {
                foreach (var img in product.ProductImages)
                {
                    await _imageService.DeleteImageAsync(img.Name);
                }

                _db.ProductImages.RemoveRange(product.ProductImages);
            }

            _db.Products.Remove(product);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
