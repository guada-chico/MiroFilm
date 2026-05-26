using Miro.Data;
using Miro.Models;
using Miro.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Miro.Services
{
    public class ReadingService : IReadingService
    {
        private readonly AppDbContext _context;
        public ReadingService(AppDbContext context) => _context = context;

        // 1. Actualizado para recibir la página actual
        public async Task<bool> UpdateStatusAsync(int userId, int bookId, string status, int currentPage)
        {
            var entry = await _context.ReadingStatuses
                .FirstOrDefaultAsync(r => r.UserId == userId && r.BookId == bookId);

            if (entry == null)
            {
                _context.ReadingStatuses.Add(new ReadingStatus
                {
                    UserId = userId,
                    BookId = bookId,
                    Status = status,
                    CurrentPage = currentPage // Guardamos la página inicial
                });
            }
            else
            {
                entry.Status = status;
                entry.CurrentPage = currentPage; // Actualizamos la página
            }
            return await _context.SaveChangesAsync() > 0;
        }

        // 2. NUEVO MÉTODO: Para la tarjeta principal de la Home (porcentaje de lo que llevas leído)
        public async Task<ReadingStatus?> GetCurrentReadingAsync(int userId)
        {
            return await _context.ReadingStatuses
                .Include(r => r.Book) // Necesario para calcular el % con TotalPages
                .Where(r => r.UserId == userId && r.Status == "Leyendo")
                .OrderByDescending(r => r.Id) // El más reciente
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<ReadingStatus>> GetUserLibraryAsync(int userId) =>
            await _context.ReadingStatuses
                .Where(r => r.UserId == userId)
                .Include(r => r.Book)
                .ToListAsync();
    }
}