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
                        TmdbId = f.TmdbMovieId,
                        Title = movie?.Title ?? "Desconocido",
                        PosterUrl = movie?.PosterUrl,
                        Director = movie?.Director,
                        Genre = movie?.Genre,
                        Rating = movie?.Rating,
                        Plot = movie?.Plot,
                        Type = "movie"
                    });
                }
                else if (f.TmdbSeriesId.HasValue)
                {
                    var series = await _context.Series
                        .FirstOrDefaultAsync(s => s.TmdbId == f.TmdbSeriesId.Value);
                    
                    result.Add(new FavoriteDto
                    {
                        Id = f.Id,
                        TmdbId = f.TmdbSeriesId,
                        Title = series?.Title ?? "Desconocido",
                        PosterUrl = series?.PosterUrl,
                        Creator = series?.Creator,
                        Genre = series?.Genre,
                        Rating = series?.Rating,
                        Plot = series?.Plot,
                        Type = "series"
                    });
                }
            }

            return Ok(result);
        }

        /// <summary>
        /// Agrega o elimina una película de favoritos.
        /// Si se añade y la película no existe localmente, la crea a partir de los datos enviados.
        /// </summary>
        [HttpPost("toggle-movie/{tmdbMovieId}")]
        public async Task<IActionResult> ToggleMovieFavorite(int tmdbMovieId, [FromBody] MovieFavoriteDto? dto = null)
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
                // Asegurar que la película existe en BD local
                var movie = await _context.Movies.FirstOrDefaultAsync(m => m.TmdbId == tmdbMovieId);
                if (movie == null && dto != null)
                {
                    movie = new Movie
                    {
                        TmdbId = tmdbMovieId,
                        Title = dto.Title ?? "Sin título",
                        Director = dto.Director,
                        Plot = dto.Plot,
                        PosterUrl = dto.PosterUrl,
                        Genre = dto.Genre,
                        Rating = dto.Rating,
                        Duration = dto.Duration ?? 0,
                        ReleaseDate = dto.ReleaseDate,
                        Language = dto.Language,
                    };
                    _context.Movies.Add(movie);
                    await _context.SaveChangesAsync();
                }

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
        /// Si se añade y la serie no existe localmente, la crea a partir de los datos enviados.
        /// </summary>
        [HttpPost("toggle-series/{tmdbSeriesId}")]
        public async Task<IActionResult> ToggleSeriesFavorite(int tmdbSeriesId, [FromBody] SeriesFavoriteDto? dto = null)
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
                // Asegurar que la serie existe en BD local
                var series = await _context.Series.FirstOrDefaultAsync(s => s.TmdbId == tmdbSeriesId);
                if (series == null && dto != null)
                {
                    series = new Series
                    {
                        TmdbId = tmdbSeriesId,
                        Title = dto.Title ?? "Sin título",
                        Creator = dto.Creator,
                        Plot = dto.Plot,
                        PosterUrl = dto.PosterUrl,
                        Genre = dto.Genre,
                        Rating = dto.Rating,
                        NumberOfSeasons = dto.NumberOfSeasons,
                        NumberOfEpisodes = dto.NumberOfEpisodes,
                        FirstAirDate = dto.FirstAirDate,
                        LastAirDate = dto.LastAirDate,
                        Language = dto.Language,
                        Status = dto.Status,
                    };
                    _context.Series.Add(series);
                    await _context.SaveChangesAsync();
                }

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

namespace Miro.Controllers
{
    public class MovieFavoriteDto
    {
        public string? Title { get; set; }
        public string? Director { get; set; }
        public string? Plot { get; set; }
        public string? PosterUrl { get; set; }
        public string? Genre { get; set; }
        public double? Rating { get; set; }
        public int? Duration { get; set; }
        public DateTime? ReleaseDate { get; set; }
        public string? Language { get; set; }
    }

    public class SeriesFavoriteDto
    {
        public string? Title { get; set; }
        public string? Creator { get; set; }
        public string? Plot { get; set; }
        public string? PosterUrl { get; set; }
        public string? Genre { get; set; }
        public double? Rating { get; set; }
        public int? NumberOfSeasons { get; set; }
        public int? NumberOfEpisodes { get; set; }
        public DateTime? FirstAirDate { get; set; }
        public DateTime? LastAirDate { get; set; }
        public string? Language { get; set; }
        public string? Status { get; set; }
    }
}
