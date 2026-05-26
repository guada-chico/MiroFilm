using Miro.Models;

namespace Miro.Services.Interfaces
{
    public interface IGutendexService
    {
        /// <summary>
        /// Busca libros gratuitos en el catálogo de Project Gutenberg.
        /// </summary>
        Task<IEnumerable<GutendexBook>> SearchBooksAsync(string query);

        /// <summary>
        /// Obtiene los libros más descargados (para la sección de clásicos).
        /// </summary>
        Task<IEnumerable<GutendexBook>> GetTopBooksAsync(int count = 20);

        /// <summary>
        /// Obtiene libros por página para paginación.
        /// </summary>
        Task<IEnumerable<GutendexBook>> GetBooksByPageAsync(int page = 1);
    }
}
