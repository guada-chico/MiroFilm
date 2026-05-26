using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Miro.Models;
using Miro.Services;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeriesController : ControllerBase
    {
        private readonly ISeriesService _seriesService;

        public SeriesController(ISeriesService seriesService)
        {
            _seriesService = seriesService;
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
    }
}
