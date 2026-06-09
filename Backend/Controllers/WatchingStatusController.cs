using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Miro.Data;
using Miro.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Miro.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WatchingStatusController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WatchingStatusController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : 0;
        }

        /// <summary>
        /// Obtiene el estado de visualización de una película o serie para un usuario.
        /// </summary>
        [HttpGet("user/{userId}/movie/{movieId}")]
        public async Task<IActionResult> GetMovieWatchingStatus(int userId, int movieId)
        {
            var status = await _context.WatchingStatuses
                .Include(w => w.Movie)
                .FirstOrDefaultAsync(w => w.UserId == userId && w.MovieId == movieId);

            return status != null ? Ok(status) : NotFound();
        }

        /// <summary>
        /// Obtiene el estado de visualización de una serie para un usuario.
        /// </summary>
        [HttpGet("user/{userId}/series/{seriesId}")]
        public async Task<IActionResult> GetSeriesWatchingStatus(int userId, int seriesId)
        {
            var status = await _context.WatchingStatuses
                .Include(w => w.Series)
                .FirstOrDefaultAsync(w => w.UserId == userId && w.SeriesId == seriesId);

            return status != null ? Ok(status) : NotFound();
        }

        /// <summary>
        /// Obtiene el estado de visualización de una película por su TmdbId.
        /// </summary>
        [HttpGet("me/movie/tmdb/{tmdbId}")]
        public async Task<IActionResult> GetMyMovieStatusByTmdb(int tmdbId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var movie = await _context.Movies.FirstOrDefaultAsync(m => m.TmdbId == tmdbId);
            if (movie == null) return Ok(new { status = (string?)null });

            var status = await _context.WatchingStatuses
                .FirstOrDefaultAsync(w => w.UserId == userId && w.MovieId == movie.Id);

            return Ok(new { status = status?.Status });
        }

        /// <summary>
        /// Obtiene el estado de visualización de una serie por su TmdbId.
        /// </summary>
        [HttpGet("me/series/tmdb/{tmdbId}")]
        public async Task<IActionResult> GetMySeriesStatusByTmdb(int tmdbId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var series = await _context.Series.FirstOrDefaultAsync(s => s.TmdbId == tmdbId);
            if (series == null) return Ok(new { status = (string?)null });

            var status = await _context.WatchingStatuses
                .FirstOrDefaultAsync(w => w.UserId == userId && w.SeriesId == series.Id);

            return Ok(new { status = status?.Status });
        }

        /// <summary>
        /// Obtiene todos los estados del usuario actual (desde JWT).
        /// </summary>
        [HttpGet("me")]
        public async Task<IActionResult> GetMyWatchingStatuses()
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var statuses = await _context.WatchingStatuses
                .Include(w => w.Movie)
                .Include(w => w.Series)
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.UpdatedAt)
                .ToListAsync();

            return Ok(statuses);
        }

        /// <summary>
        /// Crea o actualiza el estado de una película por su TmdbId (desde el usuario autenticado).
        /// Si la película no existe en BD local, la crea primero.
        /// </summary>
        [HttpPost("me/movie/tmdb/{tmdbId}")]
        public async Task<IActionResult> SetMovieStatusByTmdb(int tmdbId, [FromBody] SetStatusRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            // Buscar o crear la película en BD local
            var movie = await _context.Movies.FirstOrDefaultAsync(m => m.TmdbId == tmdbId);
            if (movie == null)
            {
                if (request.MovieData == null)
                    return BadRequest("La película no existe localmente y no se han proporcionado datos para crearla.");

                movie = new Movie
                {
                    TmdbId = tmdbId,
                    Title = request.MovieData.Title ?? "Sin título",
                    Director = request.MovieData.Director,
                    Plot = request.MovieData.Plot,
                    PosterUrl = request.MovieData.PosterUrl,
                    Genre = request.MovieData.Genre,
                    Rating = request.MovieData.Rating,
                    Duration = request.MovieData.Duration ?? 0,
                    ReleaseDate = request.MovieData.ReleaseDate,
                    Language = request.MovieData.Language
                };
                _context.Movies.Add(movie);
                await _context.SaveChangesAsync();
            }

            var existing = await _context.WatchingStatuses
                .FirstOrDefaultAsync(w => w.UserId == userId && w.MovieId == movie.Id);

            if (existing != null)
            {
                existing.Status = request.Status;
                existing.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok(new { status = existing.Status, id = existing.Id });
            }

            var newStatus = new WatchingStatus
            {
                UserId = userId,
                MovieId = movie.Id,
                Status = request.Status,
                CurrentMinute = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.WatchingStatuses.Add(newStatus);
            await _context.SaveChangesAsync();
            return Ok(new { status = newStatus.Status, id = newStatus.Id });
        }

        /// <summary>
        /// Crea o actualiza el estado de una serie por su TmdbId (desde el usuario autenticado).
        /// Si la serie no existe en BD local, la crea primero.
        /// </summary>
        [HttpPost("me/series/tmdb/{tmdbId}")]
        public async Task<IActionResult> SetSeriesStatusByTmdb(int tmdbId, [FromBody] SetStatusRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            // Buscar o crear la serie en BD local
            var series = await _context.Series.FirstOrDefaultAsync(s => s.TmdbId == tmdbId);
            if (series == null)
            {
                if (request.SeriesData == null)
                    return BadRequest("La serie no existe localmente y no se han proporcionado datos para crearla.");

                series = new Series
                {
                    TmdbId = tmdbId,
                    Title = request.SeriesData.Title ?? "Sin título",
                    Creator = request.SeriesData.Creator,
                    Plot = request.SeriesData.Plot,
                    PosterUrl = request.SeriesData.PosterUrl,
                    Genre = request.SeriesData.Genre,
                    Rating = request.SeriesData.Rating,
                    NumberOfSeasons = request.SeriesData.NumberOfSeasons,
                    NumberOfEpisodes = request.SeriesData.NumberOfEpisodes,
                    FirstAirDate = request.SeriesData.FirstAirDate,
                    LastAirDate = request.SeriesData.LastAirDate,
                    Language = request.SeriesData.Language,
                    Status = request.SeriesData.Status
                };
                _context.Series.Add(series);
                await _context.SaveChangesAsync();
            }

            var existing = await _context.WatchingStatuses
                .FirstOrDefaultAsync(w => w.UserId == userId && w.SeriesId == series.Id);

            if (existing != null)
            {
                existing.Status = request.Status;
                existing.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok(new { status = existing.Status, id = existing.Id });
            }

            var newStatus = new WatchingStatus
            {
                UserId = userId,
                SeriesId = series.Id,
                Status = request.Status,
                CurrentMinute = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.WatchingStatuses.Add(newStatus);
            await _context.SaveChangesAsync();
            return Ok(new { status = newStatus.Status, id = newStatus.Id });
        }

        /// <summary>
        /// Elimina el estado de una película por TmdbId.
        /// </summary>
        [HttpDelete("me/movie/tmdb/{tmdbId}")]
        public async Task<IActionResult> DeleteMovieStatusByTmdb(int tmdbId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var movie = await _context.Movies.FirstOrDefaultAsync(m => m.TmdbId == tmdbId);
            if (movie == null) return NotFound();

            var status = await _context.WatchingStatuses
                .FirstOrDefaultAsync(w => w.UserId == userId && w.MovieId == movie.Id);
            if (status == null) return NotFound();

            _context.WatchingStatuses.Remove(status);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Elimina el estado de una serie por TmdbId.
        /// </summary>
        [HttpDelete("me/series/tmdb/{tmdbId}")]
        public async Task<IActionResult> DeleteSeriesStatusByTmdb(int tmdbId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var series = await _context.Series.FirstOrDefaultAsync(s => s.TmdbId == tmdbId);
            if (series == null) return NotFound();

            var status = await _context.WatchingStatuses
                .FirstOrDefaultAsync(w => w.UserId == userId && w.SeriesId == series.Id);
            if (status == null) return NotFound();

            _context.WatchingStatuses.Remove(status);
            await _context.SaveChangesAsync();
            return NoContent();
        }


        /// <summary>
        /// Obtiene todas las películas y series que un usuario está viendo o ha visto.
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserWatchingStatus(int userId)
        {
            var statuses = await _context.WatchingStatuses
                .Include(w => w.Movie)
                .Include(w => w.Series)
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.UpdatedAt)
                .ToListAsync();

            return Ok(statuses);
        }

        /// <summary>
        /// Obtiene todas las películas de un usuario filtrando por estado.
        /// </summary>
        [HttpGet("user/{userId}/movies")]
        public async Task<IActionResult> GetUserMovies(int userId, [FromQuery] string? status = null)
        {
            var query = _context.WatchingStatuses
                .Include(w => w.Movie)
                .Where(w => w.UserId == userId && w.MovieId != null);

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(w => w.Status == status);
            }

            var statuses = await query
                .OrderByDescending(w => w.UpdatedAt)
                .ToListAsync();

            return Ok(statuses);
        }

        /// <summary>
        /// Obtiene todas las series de un usuario filtrando por estado.
        /// </summary>
        [HttpGet("user/{userId}/series")]
        public async Task<IActionResult> GetUserSeries(int userId, [FromQuery] string? status = null)
        {
            var query = _context.WatchingStatuses
                .Include(w => w.Series)
                .Where(w => w.UserId == userId && w.SeriesId != null);

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(w => w.Status == status);
            }

            var statuses = await query
                .OrderByDescending(w => w.UpdatedAt)
                .ToListAsync();

            return Ok(statuses);
        }

        /// <summary>
        /// Crea o actualiza el estado de visualización de una película o serie.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateOrUpdateWatchingStatus([FromBody] WatchingStatus watchingStatus)
        {
            if (watchingStatus.UserId <= 0)
                return BadRequest("UserId es obligatorio.");

            if ((watchingStatus.MovieId ?? 0) <= 0 && (watchingStatus.SeriesId ?? 0) <= 0)
                return BadRequest("MovieId o SeriesId es obligatorio.");

            WatchingStatus? existing = null;

            if (watchingStatus.MovieId.HasValue && watchingStatus.MovieId > 0)
            {
                existing = await _context.WatchingStatuses
                    .FirstOrDefaultAsync(w => w.UserId == watchingStatus.UserId && w.MovieId == watchingStatus.MovieId);
            }
            else if (watchingStatus.SeriesId.HasValue && watchingStatus.SeriesId > 0)
            {
                existing = await _context.WatchingStatuses
                    .FirstOrDefaultAsync(w => w.UserId == watchingStatus.UserId && w.SeriesId == watchingStatus.SeriesId);
            }

            if (existing != null)
            {
                existing.Status = watchingStatus.Status;
                existing.CurrentMinute = watchingStatus.CurrentMinute;
                existing.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok(existing);
            }

            watchingStatus.CreatedAt = DateTime.UtcNow;
            watchingStatus.UpdatedAt = DateTime.UtcNow;
            _context.WatchingStatuses.Add(watchingStatus);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUserWatchingStatus), new { userId = watchingStatus.UserId }, watchingStatus);
        }

        /// <summary>
        /// Actualiza el progreso de visualización (minuto actual).
        /// </summary>
        [HttpPut("{id}/progress")]
        public async Task<IActionResult> UpdateProgress(int id, [FromBody] UpdateProgressRequest request)
        {
            var status = await _context.WatchingStatuses.FindAsync(id);
            if (status == null)
                return NotFound();

            status.CurrentMinute = request.CurrentMinute;
            if (request.Status != null)
                status.Status = request.Status;
            status.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(status);
        }

        /// <summary>
        /// Elimina el estado de visualización de una película o serie.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var status = await _context.WatchingStatuses.FindAsync(id);
            if (status == null)
                return NotFound();

            _context.WatchingStatuses.Remove(status);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class UpdateProgressRequest
    {
        public int CurrentMinute { get; set; }
        public string? Status { get; set; }
    }

    public class SetStatusRequest
    {
        public string Status { get; set; } = "Pendiente";
        public MovieDataDto? MovieData { get; set; }
        public SeriesDataDto? SeriesData { get; set; }
    }

    public class MovieDataDto
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

    public class SeriesDataDto
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
