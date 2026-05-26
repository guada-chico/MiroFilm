using Miro.Data;
using Miro.Models;
using Miro.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Miro.Services
{
    public class FavoritesService : IFavoritesService
    {
        private readonly AppDbContext _context;

        public FavoritesService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> ToggleFavoriteAsync(int userId, int bookId)
        {
            var fav = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.BookId == bookId);

            if (fav != null)
            {
                _context.Favorites.Remove(fav);
                await _context.SaveChangesAsync();
                return false;
            }

            _context.Favorites.Add(new Favorite { UserId = userId, BookId = bookId });
            await _context.SaveChangesAsync();
            return true;
        }

        // ASEGÚRATE DE QUE ESTE NOMBRE COINCIDA CON LA INTERFAZ
        public async Task<IEnumerable<Book>> GetUserFavoritesAsync(int userId)
        {
            return await _context.Favorites
                .Where(f => f.UserId == userId)
                .Select(f => f.Book) // Esto trae el objeto Book relacionado
                .ToListAsync();
        }
    }
}