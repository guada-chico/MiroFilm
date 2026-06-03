using Microsoft.AspNetCore.Mvc;
using Miro.Data;
using Miro.Models;
using Microsoft.EntityFrameworkCore;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WatchingStatusController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WatchingStatusController(AppDbContext context)
        {
            _context = context;
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
}
