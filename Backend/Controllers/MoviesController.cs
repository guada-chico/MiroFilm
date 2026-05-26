using Microsoft.AspNetCore.Mvc;
using Miro.Data;
using Miro.Models;
using Microsoft.EntityFrameworkCore;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MoviesController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtiene todas las películas locales.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var movies = await _context.Movies.ToListAsync();
            return Ok(movies);
        }

        /// <summary>
        /// Obtiene una película por ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            return movie != null ? Ok(movie) : NotFound();
        }

        /// <summary>
        /// Busca películas por título.
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest("La consulta no puede estar vacía.");

            var movies = await _context.Movies
                .Where(m => m.Title.Contains(q) || (m.Plot != null && m.Plot.Contains(q)))
                .ToListAsync();
            return Ok(movies);
        }

        /// <summary>
        /// Crea una nueva película.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Movie movie)
        {
            if (string.IsNullOrWhiteSpace(movie.Title))
                return BadRequest("El título es obligatorio.");

            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = movie.Id }, movie);
        }

        /// <summary>
        /// Actualiza una película existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Movie movie)
        {
            var existingMovie = await _context.Movies.FindAsync(id);
            if (existingMovie == null)
                return NotFound();

            existingMovie.Title = movie.Title;
            existingMovie.Director = movie.Director;
            existingMovie.Plot = movie.Plot;
            existingMovie.PosterUrl = movie.PosterUrl;
            existingMovie.BackdropUrl = movie.BackdropUrl;
            existingMovie.Duration = movie.Duration;
            existingMovie.Genre = movie.Genre;
            existingMovie.Rating = movie.Rating;
            existingMovie.ReleaseDate = movie.ReleaseDate;
            existingMovie.Language = movie.Language;

            await _context.SaveChangesAsync();
            return Ok(existingMovie);
        }

        /// <summary>
        /// Elimina una película.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null)
                return NotFound();

            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
