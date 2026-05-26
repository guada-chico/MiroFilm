namespace Miro.Services.Interfaces
{
    public class NytBook
    {
        public string Title { get; set; } = string.Empty;           // Título en español (traducido o edición ES)
        public string OriginalTitle { get; set; } = string.Empty;   // Título original en inglés
        public string Author { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;     // Descripción en español
        public string OriginalDescription { get; set; } = string.Empty; // Descripción original en inglés
        public string? CoverUrl { get; set; }
        public string? AmazonUrl { get; set; }
        public int Rank { get; set; }
        public int WeeksOnList { get; set; }
        public string? Isbn { get; set; }
        public bool HasSpanishVersion { get; set; }
    }

    public interface INytBooksService
    {
        Task<IEnumerable<NytBook>> GetBestSellersAsync(string listName = "hardcover-fiction");
    }
}
