using Microsoft.AspNetCore.Mvc;
using Miro.Data;
using Miro.Models;
using Miro.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITmdbService _tmdbService;

        public MoviesController(AppDbContext context, ITmdbService tmdbService)
        {
            _context = context;
            _tmdbService = tmdbService;
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
        /// Obtiene películas populares de TMDB.
        /// </summary>
        [HttpGet("tmdb/popular")]
        public async Task<IActionResult> GetPopularMoviesFromTmdb([FromQuery] int page = 1)
        {
            try
            {
                var tmdbMovies = await _tmdbService.GetPopularMoviesAsync(page);
                return Ok(tmdbMovies);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene películas mejor calificadas de TMDB.
        /// </summary>
        [HttpGet("tmdb/top-rated")]
        public async Task<IActionResult> GetTopRatedMoviesFromTmdb([FromQuery] int page = 1)
        {
            try
            {
                var tmdbMovies = await _tmdbService.GetTopRatedMoviesAsync(page);
                return Ok(tmdbMovies);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene películas próximas a estrenarse de TMDB.
        /// </summary>
        [HttpGet("tmdb/upcoming")]
        public async Task<IActionResult> GetUpcomingMoviesFromTmdb([FromQuery] int page = 1)
        {
            try
            {
                var tmdbMovies = await _tmdbService.GetUpcomingMoviesAsync(page);
                return Ok(tmdbMovies);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene películas en cines actualmente de TMDB.
        /// </summary>
        [HttpGet("tmdb/now-playing")]
        public async Task<IActionResult> GetNowPlayingMoviesFromTmdb([FromQuery] int page = 1)
        {
            try
            {
                var tmdbMovies = await _tmdbService.GetNowPlayingMoviesAsync(page);
                return Ok(tmdbMovies);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Busca películas en TMDB.
        /// </summary>
        [HttpGet("tmdb/search")]
        public async Task<IActionResult> SearchMoviesInTmdb([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest("La consulta no puede estar vacía.");

            try
            {
                var tmdbMovies = await _tmdbService.SearchMoviesAsync(q);
                return Ok(tmdbMovies);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene películas por género de TMDB.
        /// </summary>
        [HttpGet("tmdb/genre")]
        public async Task<IActionResult> GetMoviesByGenreFromTmdb(int? genreId, int page = 1)
        {
            try
            {
                if (!genreId.HasValue || genreId <= 0)
                {
                    return BadRequest(new { error = "genreId es requerido y debe ser mayor a 0" });
                }

                var tmdbMovies = await _tmdbService.GetMoviesByGenreAsync(genreId.Value, page);
                return Ok(tmdbMovies);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene detalles de una película de TMDB.
        /// </summary>
        [HttpGet("tmdb/{tmdbId}")]
        public async Task<IActionResult> GetMovieDetailsFromTmdb(int tmdbId)
        {
            try
            {
                var movie = await _tmdbService.GetMovieDetailsAsync(tmdbId);
                return movie != null ? Ok(movie) : NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
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
