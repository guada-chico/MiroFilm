namespace Miro.Models
{
    public class Movie
    {
        public int Id { get; set; }
        public int TmdbId { get; set; }  // ID de TMDb
        public string Title { get; set; } = string.Empty;
        public string? Director { get; set; }
        public string? Plot { get; set; }
        public string? PosterUrl { get; set; }
        public string? BackdropUrl { get; set; }
        public int Duration { get; set; }  // Duración en minutos
        public string? Genre { get; set; }
        public double? Rating { get; set; }  // Calificación de TMDb (0-10)
        public DateTime? ReleaseDate { get; set; }
        public string? Language { get; set; }
    }
}
