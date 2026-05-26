using Miro.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;
        public BooksController(IBookService bookService) => _bookService = bookService;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _bookService.GetAllBooksAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);
            return book != null ? Ok(book) : NotFound();
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(string q) => Ok(await _bookService.SearchBooksAsync(q));
    }
}