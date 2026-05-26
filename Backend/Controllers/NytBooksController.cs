using Microsoft.AspNetCore.Mvc;
using Miro.Services.Interfaces;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NytBooksController : ControllerBase
    {
        private readonly INytBooksService _nytService;

        public NytBooksController(INytBooksService nytService)
        {
            _nytService = nytService;
        }

        /// <summary>
        /// Devuelve los best sellers del NYT de una lista concreta.
        /// Listas: hardcover-fiction | hardcover-nonfiction |
        ///         combined-print-and-e-book-fiction | combined-print-and-e-book-nonfiction
        /// </summary>
        [HttpGet("{listName}")]
        public async Task<IActionResult> GetBestSellers(string listName = "hardcover-fiction")
        {
            var books = await _nytService.GetBestSellersAsync(listName);
            return Ok(books.ToList());
        }

        [HttpGet]
        public async Task<IActionResult> GetFictionBestSellers()
        {
            var books = await _nytService.GetBestSellersAsync("hardcover-fiction");
            return Ok(books.ToList());
        }
    }
}
