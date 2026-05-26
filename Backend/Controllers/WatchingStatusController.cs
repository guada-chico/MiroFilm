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
        /// Obtiene el estado de visualización de una película para un usuario.
        /// </summary>
        [HttpGet("user/{userId}/movie/{movieId}")]
        public async Task<IActionResult> GetWatchingStatus(int userId, int movieId)
        {
            var status = await _context.WatchingStatuses
                .Include(w => w.Movie)
                .FirstOrDefaultAsync(w => w.UserId == userId && w.MovieId == movieId);

            return status != null ? Ok(status) : NotFound();
        }

        /// <summary>
        /// Obtiene todas las películas que un usuario está viendo o ha visto.
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserWatchingStatus(int userId)
        {
            var statuses = await _context.WatchingStatuses
                .Include(w => w.Movie)
                .Where(w => w.UserId == userId)
                .ToListAsync();

            return Ok(statuses);
        }

        /// <summary>
        /// Crea o actualiza el estado de visualización de una película.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateOrUpdateWatchingStatus([FromBody] WatchingStatus watchingStatus)
        {
            if (watchingStatus.UserId <= 0 || watchingStatus.MovieId <= 0)
                return BadRequest("UserId y MovieId son obligatorios.");

            var existing = await _context.WatchingStatuses
                .FirstOrDefaultAsync(w => w.UserId == watchingStatus.UserId && w.MovieId == watchingStatus.MovieId);

            if (existing != null)
            {
                existing.Status = watchingStatus.Status;
                existing.CurrentMinute = watchingStatus.CurrentMinute;
                await _context.SaveChangesAsync();
                return Ok(existing);
            }

            _context.WatchingStatuses.Add(watchingStatus);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetWatchingStatus), new { userId = watchingStatus.UserId, movieId = watchingStatus.MovieId }, watchingStatus);
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

            await _context.SaveChangesAsync();
            return Ok(status);
        }

        /// <summary>
        /// Elimina el estado de visualización de una película.
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
