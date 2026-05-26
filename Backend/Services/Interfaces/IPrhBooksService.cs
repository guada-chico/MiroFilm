
namespace Miro.Services.Interfaces
{
    public class PrhBook
    {
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
        public string? Isbn { get; set; }
        public string? Publisher { get; set; }   // Sello editorial (Alfaguara, Lumen, etc.)
        public string? OnSaleDate { get; set; }
        public string? Category { get; set; }
        public string? Language { get; set; }
    }

    public interface IPrhBooksService
    {
        /// <summary>
        /// Novedades recientes en español (últimos 180 días).
        /// </summary>
        Task<IEnumerable<PrhBook>> GetNewReleasesAsync(int rows = 20);

        /// <summary>
        /// Próximas publicaciones en español (próximos 90 días).
        /// </summary>
        Task<IEnumerable<PrhBook>> GetComingSoonAsync(int rows = 20);

        /// <summary>
        /// Búsqueda de libros por texto libre.
        /// </summary>
        Task<IEnumerable<PrhBook>> SearchAsync(string query, int rows = 20);

        /// <summary>
        /// Libros por categoría BISAC (ej: "FIC000000" = Ficción general).
        /// </summary>
        Task<IEnumerable<PrhBook>> GetByCategoryAsync(string catUri, int rows = 20);
    }
}
