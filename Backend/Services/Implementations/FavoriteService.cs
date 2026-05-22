using Microsoft.EntityFrameworkCore;
using AutoMapper;
using RoomManagement.Data;
using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations;

public class FavoriteService : IFavoriteService
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public FavoriteService(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<bool> ToggleFavoriteAsync(string userId, string hotelId)
    {
        var existingFavorite = await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.HotelId == hotelId);

        if (existingFavorite != null)
        {
            _context.Favorites.Remove(existingFavorite);
            await _context.SaveChangesAsync();
            return false; // Removed
        }
        
        var favorite = new Favorite
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            HotelId = hotelId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Favorites.Add(favorite);
        await _context.SaveChangesAsync();
        return true; // Added
    }

    public async Task<IEnumerable<SearchHotelResponseDto>> GetFavoritesAsync(string userId)
    {
        var favoriteHotels = await _context.Favorites
            .Where(f => f.UserId == userId)
            .Include(f => f.Hotel)
                .ThenInclude(h => h.Images)
            .Include(f => f.Hotel)
                .ThenInclude(h => h.Rooms.Where(r => r.IsActive))
            .Select(f => f.Hotel)
            .ToListAsync();

        var dtos = _mapper.Map<IEnumerable<SearchHotelResponseDto>>(favoriteHotels);

        foreach (var dto in dtos)
        {
            dto.IsFavorited = true; // Always true for favorites list
        }

        return dtos;
    }

    public async Task<bool> IsFavoritedAsync(string userId, string hotelId)
    {
        return await _context.Favorites
            .AnyAsync(f => f.UserId == userId && f.HotelId == hotelId);
    }
}
