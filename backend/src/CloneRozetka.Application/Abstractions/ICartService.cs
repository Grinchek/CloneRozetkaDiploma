using CloneRozetka.Application.Categories.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CloneRozetka.Application.Abstractions
{
    public interface ICartService
    {
        Task<IReadOnlyList<CartItemDTO>> ListAsync(int userId);
        Task<CartItemDTO?> GetAsync(int userId, long productId);
        Task AddAsync(CartItemDTO dto);
        Task UpdateAsync(CartItemDTO dto);
        Task DeleteAsync(int userId, long productId);
    }
}