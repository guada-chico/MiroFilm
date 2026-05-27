using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Miro.Models;
using Miro.Services;
using Miro.Services.Interfaces;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeriesController : ControllerBase
    {
        private readonly ISeriesService _seriesService;
        private readonly ITmdbService _tmdbService;

        public SeriesController(ISeriesService seriesService, ITmdbService tmdbService)
        {
            _seriesService = seriesService;
            _tmdbService = tmdbService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Series>>> GetAllSeries()
        {
            var series = await _seriesService.GetAllSeriesAsync();
            return Ok(series);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Series>> GetSeriesById(int id)
        {
            var series = await _seriesService.GetSeriesByIdAsync(id);
            if (series == null)
                return NotFound();

            return Ok(series);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Series>> AddSeries([FromBody] Series series)
        {
            if (string.IsNullOrEmpty(series.Title))
                return BadRequest("El título es requerido");

            var newSeries = await _seriesService.AddSeriesAsync(series);
            return CreatedAtAction(nameof(GetSeriesById), new { id = newSeries.Id }, newSeries);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<Series>> UpdateSeries(int id, [FromBody] Series series)
        {
            var updatedSeries = await _seriesService.UpdateSeriesAsync(id, series);
            if (updatedSeries == null)
                return NotFound();

            return Ok(updatedSeries);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteSeries(int id)
        {
            var success = await _seriesService.DeleteSeriesAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Obtiene series populares de TMDB.
        /// </summary>
        [HttpGet("tmdb/popular")]
        public async Task<IActionResult> GetPopularSeriesFromTmdb([FromQuery] int page = 1)
        {
            try
            {
                var tmdbSeries = await _tmdbService.GetPopularSeriesAsync(page);
                return Ok(tmdbSeries);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene series mejor calificadas de TMDB.
        /// </summary>
        [HttpGet("tmdb/top-rated")]
        public async Task<IActionResult> GetTopRatedSeriesFromTmdb([FromQuery] int page = 1)
        {
            try
            {
                var tmdbSeries = await _tmdbService.GetTopRatedSeriesAsync(page);
                return Ok(tmdbSeries);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Busca series en TMDB.
        /// </summary>
        [HttpGet("tmdb/search")]
        public async Task<IActionResult> SearchSeriesInTmdb([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest("La consulta no puede estar vacía.");

            try
            {
                var tmdbSeries = await _tmdbService.SearchSeriesAsync(q);
                return Ok(tmdbSeries);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene series por género de TMDB.
        /// </summary>
        [HttpGet("tmdb/genre")]
        public async Task<IActionResult> GetSeriesByGenreFromTmdb(int? genreId, int page = 1)
        {
            try
            {
                if (!genreId.HasValue || genreId <= 0)
                {
                    return BadRequest(new { error = "genreId es requerido y debe ser mayor a 0" });
                }

                var tmdbSeries = await _tmdbService.GetSeriesByGenreAsync(genreId.Value, page);
                return Ok(tmdbSeries);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene detalles de una serie de TMDB.
        /// </summary>
        [HttpGet("tmdb/{tmdbId}")]
        public async Task<IActionResult> GetSeriesDetailsFromTmdb(int tmdbId)
        {
            try
            {
                var series = await _tmdbService.GetSeriesDetailsAsync(tmdbId);
                return series != null ? Ok(series) : NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
