using Miro.Models;

namespace Miro.Services.Interfaces
{
    public interface ITmdbService
    {
        /// <summary>
        /// Busca películas por título.
        /// </summary>
        Task<IEnumerable<Movie>> SearchMoviesAsync(string query);

        /// <summary>
        /// Obtiene las películas más populares.
        /// </summary>
        Task<IEnumerable<Movie>> GetPopularMoviesAsync(int page = 1);

        /// <summary>
        /// Obtiene las películas mejor calificadas.
        /// </summary>
        Task<IEnumerable<Movie>> GetTopRatedMoviesAsync(int page = 1);

        /// <summary>
        /// Obtiene las películas próximas a estrenarse.
        /// </summary>
        Task<IEnumerable<Movie>> GetUpcomingMoviesAsync(int page = 1);

        /// <summary>
        /// Obtiene películas en cines actualmente.
        /// </summary>
        Task<IEnumerable<Movie>> GetNowPlayingMoviesAsync(int page = 1);

        /// <summary>
        /// Obtiene películas por género.
        /// </summary>
        Task<IEnumerable<Movie>> GetMoviesByGenreAsync(int genreId, int page = 1);

        /// <summary>
        /// Obtiene detalles de una película específica.
        /// </summary>
        Task<Movie?> GetMovieDetailsAsync(int tmdbId);
    }
}
