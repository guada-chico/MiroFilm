using Miro.Data;
using Miro.Models;
using Miro.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Miro.Services
{
    public class BookService : IBookService
    {
        private readonly AppDbContext _context;
        public BookService(AppDbContext context) => _context = context;

        public async Task<IEnumerable<Book>> GetAllBooksAsync() => await _context.Books.ToListAsync();

        public async Task<Book?> GetBookByIdAsync(int id) => await _context.Books.FindAsync(id);

        public async Task<IEnumerable<Book>> SearchBooksAsync(string term) =>
            await _context.Books.Where(b => b.Title.Contains(term) || b.Author.Contains(term)).ToListAsync();
    }
}