using AutoMapper;
using AutoMapper.QueryableExtensions;
using CloneRozetka.Application.Abstractions;
using CloneRozetka.Application.Categories.DTOs;
using CloneRozetka.Domain.Entities;

namespace CloneRozetka.Infrastructure.Services.Categories
{
    public class CartService : ICartService
    {
        private readonly IRepository<CartEntity> _repo;
        private readonly IMapper _mapper;

        public CartService(IRepository<CartEntity> repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<IReadOnlyList<CartItemDTO>> ListAsync(int userId)
            => await _repo.ToListAsync(
                _repo.Query(asNoTracking: true)
                     .Where(c => c.UserId == userId)
                     .ProjectTo<CartItemDTO>(_mapper.ConfigurationProvider)
            );

        public async Task<CartItemDTO?> GetAsync(int userId, long productId)
            => await _repo.FirstOrDefaultAsync(
                _repo.Query(asNoTracking: true)
                     .Where(c => c.UserId == userId && c.ProductId == productId)
                     .ProjectTo<CartItemDTO>(_mapper.ConfigurationProvider)
            );

        public async Task AddAsync(CartItemDTO dto)
        {
            if (dto is null) throw new ArgumentNullException(nameof(dto));
            if (dto.UserId <= 0) throw new ArgumentException("UserId must be provided and greater than zero.", nameof(dto));
            if (dto.ProductId <= 0) throw new ArgumentException("ProductId must be provided and greater than zero.", nameof(dto));

            var entity = new CartEntity
            {
                UserId = dto.UserId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity <= 0 ? 1 : dto.Quantity
            };

            await _repo.AddAsync(entity);
        }

        public async Task UpdateAsync(CartItemDTO dto)
        {
            var entity = await _repo.FirstOrDefaultAsync<CartEntity>(
                _repo.Query(asNoTracking: false)
                     .Where(c => c.UserId == dto.UserId && c.ProductId == dto.ProductId)
            ) ?? throw new KeyNotFoundException("Cart item not found");

            entity.Quantity = dto.Quantity;
            await _repo.UpdateAsync(entity);
        }

        public async Task DeleteAsync(int userId, long productId)
        {
            var entity = await _repo.FirstOrDefaultAsync<CartEntity>(
                _repo.Query(asNoTracking: false)
                     .Where(c => c.UserId == userId && c.ProductId == productId)
            ) ?? throw new KeyNotFoundException("Cart item not found");

            await _repo.DeleteAsync(entity);
        }
    }
}