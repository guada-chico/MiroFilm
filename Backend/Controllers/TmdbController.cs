using Microsoft.AspNetCore.Mvc;
using Miro.Services.Interfaces;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TmdbController : ControllerBase
    {
        private readonly ITmdbService _tmdbService;

        public TmdbController(ITmdbService tmdbService)
        {
            _tmdbService = tmdbService;
        }

        /// <summary>
        /// Busca películas por título.
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest("La consulta no puede estar vacía.");

            var movies = await _tmdbService.SearchMoviesAsync(q);
            return Ok(movies.ToList());
        }

        /// <summary>
        /// Obtiene las películas más populares.
        /// </summary>
        [HttpGet("popular")]
        public async Task<IActionResult> GetPopular([FromQuery] int page = 1)
        {
            var movies = await _tmdbService.GetPopularMoviesAsync(page);
            return Ok(movies.ToList());
        }

        /// <summary>
        /// Obtiene las películas mejor calificadas.
        /// </summary>
        [HttpGet("top-rated")]
        public async Task<IActionResult> GetTopRated([FromQuery] int page = 1)
        {
            var movies = await _tmdbService.GetTopRatedMoviesAsync(page);
            return Ok(movies.ToList());
        }

        /// <summary>
        /// Obtiene las películas próximas a estrenarse.
        /// </summary>
        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcoming([FromQuery] int page = 1)
        {
            var movies = await _tmdbService.GetUpcomingMoviesAsync(page);
            return Ok(movies.ToList());
        }

        /// <summary>
        /// Obtiene películas en cines actualmente.
        /// </summary>
        [HttpGet("now-playing")]
        public async Task<IActionResult> GetNowPlaying([FromQuery] int page = 1)
        {
            var movies = await _tmdbService.GetNowPlayingMoviesAsync(page);
            return Ok(movies.ToList());
        }

        /// <summary>
        /// Obtiene películas por género.
        /// </summary>
        [HttpGet("genre/{genreId}")]
        public async Task<IActionResult> GetByGenre(int genreId, [FromQuery] int page = 1)
        {
            var movies = await _tmdbService.GetMoviesByGenreAsync(genreId, page);
            return Ok(movies.ToList());
        }

        /// <summary>
        /// Obtiene detalles de una película específica.
        /// </summary>
        [HttpGet("{tmdbId}")]
        public async Task<IActionResult> GetDetails(int tmdbId)
        {
            var movie = await _tmdbService.GetMovieDetailsAsync(tmdbId);
            return movie != null ? Ok(movie) : NotFound();
        }

        /// <summary>
        /// Busca series por título.
        /// </summary>
        [HttpGet("series/search")]
        public async Task<IActionResult> SearchSeries([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest("La consulta no puede estar vacía.");

            var series = await _tmdbService.SearchSeriesAsync(q);
            return Ok(series.ToList());
        }

        /// <summary>
        /// Obtiene las series más populares.
        /// </summary>
        [HttpGet("series/popular")]
        public async Task<IActionResult> GetPopularSeries([FromQuery] int page = 1)
        {
            var series = await _tmdbService.GetPopularSeriesAsync(page);
            return Ok(series.ToList());
        }

        /// <summary>
        /// Obtiene las series mejor calificadas.
        /// </summary>
        [HttpGet("series/top-rated")]
        public async Task<IActionResult> GetTopRatedSeries([FromQuery] int page = 1)
        {
            var series = await _tmdbService.GetTopRatedSeriesAsync(page);
            return Ok(series.ToList());
        }

        /// <summary>
        /// Obtiene detalles de una serie específica.
        /// </summary>
        [HttpGet("series/{tmdbId}")]
        public async Task<IActionResult> GetSeriesDetails(int tmdbId)
        {
            var series = await _tmdbService.GetSeriesDetailsAsync(tmdbId);
            return series != null ? Ok(series) : NotFound();
        }
    }
}
