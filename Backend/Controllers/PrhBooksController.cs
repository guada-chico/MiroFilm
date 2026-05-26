
using Microsoft.AspNetCore.Mvc;
using Miro.Services.Interfaces;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PrhBooksController : ControllerBase
    {
        private readonly IPrhBooksService _prhService;

        public PrhBooksController(IPrhBooksService prhService)
        {
            _prhService = prhService;
        }

        /// <summary>Novedades recientes en español (últimos 180 días).</summary>
        [HttpGet("new-releases")]
        public async Task<IActionResult> GetNewReleases([FromQuery] int rows = 20)
        {
            try
            {
                var books = await _prhService.GetNewReleasesAsync(rows);
                return Ok(books.ToList());
            }
            catch (InvalidOperationException ex)
            {
                // Key no activada aún
                return StatusCode(503, new { error = ex.Message, activated = false });
            }
        }

        /// <summary>Próximas publicaciones en español.</summary>
        [HttpGet("coming-soon")]
        public async Task<IActionResult> GetComingSoon([FromQuery] int rows = 20)
        {
            try
            {
                var books = await _prhService.GetComingSoonAsync(rows);
                return Ok(books.ToList());
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(503, new { error = ex.Message, activated = false });
            }
        }

        /// <summary>Búsqueda libre de libros.</summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] int rows = 20)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest("El parámetro 'q' es obligatorio.");
            try
            {
                var books = await _prhService.SearchAsync(q, rows);
                return Ok(books.ToList());
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(503, new { error = ex.Message, activated = false });
            }
        }

        /// <summary>Libros por categoría BISAC.</summary>
        [HttpGet("category/{catUri}")]
        public async Task<IActionResult> GetByCategory(string catUri, [FromQuery] int rows = 20)
        {
            try
            {
                var books = await _prhService.GetByCategoryAsync(catUri, rows);
                return Ok(books.ToList());
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(503, new { error = ex.Message, activated = false });
            }
        }

        /// <summary>Estado de la key: indica si está activada o no.</summary>
        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            try
            {
                var books = await _prhService.GetNewReleasesAsync(1);
                return Ok(new { activated = true, message = "PRH API key is active." });
            }
            catch (InvalidOperationException ex)
            {
                return Ok(new { activated = false, message = ex.Message });
            }
        }
    }
}
