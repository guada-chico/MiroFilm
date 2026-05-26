using Microsoft.AspNetCore.Mvc;
using Miro.Services.Interfaces;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExternalBooksController : ControllerBase
    {
        private readonly IGoogleBookService _googleService;
        private readonly IOpenLibraryService _openLibraryService;

        public ExternalBooksController(IGoogleBookService googleService, IOpenLibraryService openLibraryService)
        {
            _googleService = googleService;
            _openLibraryService = openLibraryService;
        }

        /// <summary>Búsqueda libre (siempre en español).</summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest("La consulta no puede estar vacía.");

            try
            {
                var results = await _googleService.SearchBooksAsync(q);
                var booksList = results.ToList();

                // Refuerzo de portadas con Open Library si falta imagen
                foreach (var book in booksList.Where(b => string.IsNullOrEmpty(b.ImageUrl) && !string.IsNullOrEmpty(b.Isbn)))
                {
                    var cover = await _openLibraryService.GetHighResCoverUrlAsync(book.Isbn!);
                    if (!string.IsNullOrEmpty(cover)) book.ImageUrl = cover;
                }

                return Ok(booksList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        /// <summary>Libros actuales en español por género.</summary>
        [HttpGet("recommendations")]
        public async Task<IActionResult> GetRecommendations([FromQuery] string genre = "novela")
        {
            var books = await _googleService.GetSpanishRecommendationsAsync(genre);
            return Ok(books.ToList());
        }

        /// <summary>Clásicos de la literatura en español.</summary>
        [HttpGet("classics")]
        public async Task<IActionResult> GetClassics()
        {
            var books = await _googleService.GetSpanishClassicsAsync();
            return Ok(books.ToList());
        }
    }
}