using Miro.Models;

namespace Miro.Services.Interfaces
{
    public interface IGoogleBookService
    {
        /// <summary>Búsqueda libre por texto, sin filtro de idioma.</summary>
        Task<IEnumerable<Book>> SearchBooksAsync(string query);

        /// <summary>
        /// Libros actuales en español ordenados por novedad.
        /// </summary>
        Task<IEnumerable<Book>> GetSpanishRecommendationsAsync(string genre = "novela");

        /// <summary>
        /// Clásicos de la literatura en español.
        /// </summary>
        Task<IEnumerable<Book>> GetSpanishClassicsAsync();
    }
}
