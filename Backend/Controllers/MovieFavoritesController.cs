using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Miro.Data;
using Miro.Dto;
using Miro.Models;
using System.Security.Claims;

namespace Miro.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/movie-favorites")]
    public class MovieFavoritesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MovieFavoritesController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtiene todos los favoritos (películas y series) del usuario actual.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMyFavorites()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var favorites = await _context.Favorites
                .Where(f => f.UserId == userId && (f.TmdbMovieId.HasValue || f.TmdbSeriesId.HasValue))
                .ToListAsync();

            var result = new List<FavoriteDto>();

            foreach (var f in favorites)
            {
                if (f.TmdbMovieId.HasValue)
                {
                    var movie = await _context.Movies
                        .FirstOrDefaultAsync(m => m.TmdbId == f.TmdbMovieId.Value);
                    
                    result.Add(new FavoriteDto
                    {
                        Id = f.Id,
                        tmdbId = f.TmdbMovieId,
                        Title = movie?.Title ?? "Desconocido",
                        posterUrl = movie?.PosterUrl,
                        director = movie?.Director,
                        genre = movie?.Genre,
                        rating = movie?.Rating,
                        plot = movie?.Plot,
                        type = "movie"
                    });
                }
                else if (f.TmdbSeriesId.HasValue)
                {
                    var series = await _context.Series
                        .FirstOrDefaultAsync(s => s.TmdbId == f.TmdbSeriesId.Value);
                    
                    result.Add(new FavoriteDto
                    {
                        Id = f.Id,
                        tmdbId = f.TmdbSeriesId,
                        Title = series?.Title ?? "Desconocido",
                        posterUrl = series?.PosterUrl,
                        creator = series?.Creator,
                        genre = series?.Genre,
                        rating = series?.Rating,
                        plot = series?.Plot,
                        type = "series"
                    });
                }
            }

            return Ok(result);
        }

        /// <summary>
        /// Agrega o elimina una película de favoritos.
        /// </summary>
        [HttpPost("toggle-movie/{tmdbMovieId}")]
        public async Task<IActionResult> ToggleMovieFavorite(int tmdbMovieId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var existing = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.TmdbMovieId == tmdbMovieId);

            if (existing != null)
            {
                _context.Favorites.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Película eliminada de favoritos", isFavorite = false });
            }
            else
            {
                var favorite = new Favorite
                {
                    UserId = userId,
                    TmdbMovieId = tmdbMovieId
                };
                _context.Favorites.Add(favorite);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Película añadida a favoritos", isFavorite = true });
            }
        }

        /// <summary>
        /// Agrega o elimina una serie de favoritos.
        /// </summary>
        [HttpPost("toggle-series/{tmdbSeriesId}")]
        public async Task<IActionResult> ToggleSeriesFavorite(int tmdbSeriesId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var existing = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.TmdbSeriesId == tmdbSeriesId);

            if (existing != null)
            {
                _context.Favorites.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Serie eliminada de favoritos", isFavorite = false });
            }
            else
            {
                var favorite = new Favorite
                {
                    UserId = userId,
                    TmdbSeriesId = tmdbSeriesId
                };
                _context.Favorites.Add(favorite);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Serie añadida a favoritos", isFavorite = true });
            }
        }

        /// <summary>
        /// Verifica si una película es favorita del usuario.
        /// </summary>
        [HttpGet("is-favorite-movie/{tmdbMovieId}")]
        public async Task<IActionResult> IsMovieFavorite(int tmdbMovieId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var isFavorite = await _context.Favorites
                .AnyAsync(f => f.UserId == userId && f.TmdbMovieId == tmdbMovieId);

            return Ok(new { isFavorite });
        }

        /// <summary>
        /// Verifica si una serie es favorita del usuario.
        /// </summary>
        [HttpGet("is-favorite-series/{tmdbSeriesId}")]
        public async Task<IActionResult> IsSeriesFavorite(int tmdbSeriesId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var isFavorite = await _context.Favorites
                .AnyAsync(f => f.UserId == userId && f.TmdbSeriesId == tmdbSeriesId);

            return Ok(new { isFavorite });
        }
    }
}
