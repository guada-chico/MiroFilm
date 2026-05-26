using Microsoft.AspNetCore.Mvc;
using Miro.Services.Interfaces;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GutendexController : ControllerBase
    {
        private readonly IGutendexService _gutendexService;

        public GutendexController(IGutendexService gutendexService)
        {
            _gutendexService = gutendexService;
        }

        /// <summary>
        /// Busca libros gratuitos en Project Gutenberg.
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest("La consulta no puede estar vacía.");

            var results = await _gutendexService.SearchBooksAsync(q);
            return Ok(results);
        }

        /// <summary>
        /// Devuelve los libros clásicos más populares (top descargas).
        /// </summary>
        [HttpGet("top")]
        public async Task<IActionResult> GetTop([FromQuery] int count = 20)
        {
            var results = await _gutendexService.GetTopBooksAsync(count);
            return Ok(results);
        }

        /// <summary>
        /// Devuelve libros por página para paginación.
        /// </summary>
        [HttpGet("page")]
        public async Task<IActionResult> GetByPage([FromQuery] int page = 1)
        {
            var results = await _gutendexService.GetBooksByPageAsync(page);
            return Ok(results);
        }
    }
}
