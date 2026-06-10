namespace Miro.Models
{
    public class Favorite
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int? MovieId { get; set; }  // Para películas
        public int? SeriesId { get; set; }  // Para series
        public int? TmdbMovieId { get; set; }  // ID de TMDB para películas
        public int? TmdbSeriesId { get; set; }  // ID de TMDB para series

        // Estas propiedades permiten hacer el .Include(f => f.Book) en el controlador
        public User? User { get; set; }
        public Movie? Movie { get; set; }
        public Series? Series { get; set; }
    }
}
