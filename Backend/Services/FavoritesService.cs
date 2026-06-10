using Miro.Data;
using Miro.Models;
using Miro.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Miro.Services
{
    public class FavoritesService : IFavoritesService
    {
        private readonly AppDbContext _context;

        public FavoritesService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Favorite>> GetUserFavoritesAsync(int userId)
        {
            return await _context.Favorites
                .Include(f => f.Movie)
                .Include(f => f.Series)
                .Where(f => f.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<Favorite>> GetUserMovieFavoritesAsync(int userId)
        {
            return await _context.Favorites
                .Include(f => f.Movie)
                .Where(f => f.UserId == userId && f.MovieId != null)
                .ToListAsync();
        }

        public async Task<List<Favorite>> GetUserSeriesFavoritesAsync(int userId)
        {
            return await _context.Favorites
                .Include(f => f.Series)
                .Where(f => f.UserId == userId && f.SeriesId != null)
                .ToListAsync();
        }

        public async Task<Favorite?> AddFavoriteAsync(int userId, int? movieId, int? seriesId, int? tmdbMovieId, int? tmdbSeriesId)
        {
            // Evitar duplicados
            var exists = await _context.Favorites.AnyAsync(f =>
                f.UserId == userId &&
                f.MovieId == movieId &&
                f.SeriesId == seriesId);

            if (exists) return null;

            var favorite = new Favorite
            {
                UserId = userId,
                MovieId = movieId,
                SeriesId = seriesId,
                TmdbMovieId = tmdbMovieId,
                TmdbSeriesId = tmdbSeriesId
            };

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();
            return favorite;
        }

        public async Task<bool> RemoveFavoriteAsync(int userId, int? movieId, int? seriesId)
        {
            var favorite = await _context.Favorites.FirstOrDefaultAsync(f =>
                f.UserId == userId &&
                f.MovieId == movieId &&
                f.SeriesId == seriesId);

            if (favorite == null) return false;

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsFavoriteAsync(int userId, int? movieId, int? seriesId)
        {
            return await _context.Favorites.AnyAsync(f =>
                f.UserId == userId &&
                f.MovieId == movieId &&
                f.SeriesId == seriesId);
        }
    }
}