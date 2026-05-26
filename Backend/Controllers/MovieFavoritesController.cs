using Microsoft.AspNetCore.Mvc;
using Miro.Data;
using Miro.Models;
using Microsoft.EntityFrameworkCore;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MovieFavoritesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MovieFavoritesController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtiene todas las películas favoritas de un usuario.
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserFavoriteMovies(int userId)
        {
            var favorites = await _context.Favorites
                .Include(f => f.Movie)
                .Where(f => f.UserId == userId && f.MovieId != null)
                .ToListAsync();

            return Ok(favorites);
        }

        /// <summary>
        /// Verifica si una película es favorita de un usuario.
        /// </summary>
        [HttpGet("user/{userId}/movie/{movieId}")]
        public async Task<IActionResult> IsFavorite(int userId, int movieId)
        {
            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.MovieId == movieId);

            return Ok(new { isFavorite = favorite != null });
        }

        /// <summary>
        /// Añade una película a favoritos.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> AddFavorite([FromBody] AddMovieFavoriteRequest request)
        {
            if (request.UserId <= 0 || request.MovieId <= 0)
                return BadRequest("UserId y MovieId son obligatorios.");

            var existing = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == request.UserId && f.MovieId == request.MovieId);

            if (existing != null)
                return BadRequest("Esta película ya está en favoritos.");

            var favorite = new Favorite
            {
                UserId = request.UserId,
                MovieId = request.MovieId
            };

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(IsFavorite), new { userId = request.UserId, movieId = request.MovieId }, favorite);
        }

        /// <summary>
        /// Elimina una película de favoritos.
        /// </summary>
        [HttpDelete("user/{userId}/movie/{movieId}")]
        public async Task<IActionResult> RemoveFavorite(int userId, int movieId)
        {
            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.MovieId == movieId);

            if (favorite == null)
                return NotFound();

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class AddMovieFavoriteRequest
    {
        public int UserId { get; set; }
        public int MovieId { get; set; }
    }
}
