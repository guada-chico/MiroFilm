using Miro.Data;
using Miro.Models;
using Miro.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Miro.Services
{
    public class RecommendationService : IRecommendationService
    {
        private readonly AppDbContext _context;
        private readonly ITmdbService _tmdbService;

        public RecommendationService(AppDbContext context, ITmdbService tmdbService)
        {
            _context = context;
            _tmdbService = tmdbService;
        }

        public async Task<IEnumerable<Movie>> GetRecommendationsAsync(int userId)
        {
            // 1. Obtener las películas favoritas del usuario
            var favoriteMovieIds = await _context.Favorites
                .Where(f => f.UserId == userId && f.MovieId != null)
                .Select(f => f.MovieId)
                .ToListAsync();

            // 2. Si el usuario no tiene películas favoritas, devolver películas populares
            if (!favoriteMovieIds.Any())
            {
                var popularMovies = await _tmdbService.GetPopularMoviesAsync(1);
                return popularMovies.Take(20).ToList();
            }

            // 3. Obtener los géneros de las películas favoritas
            var favoriteMovies = await _context.Movies
                .Where(m => favoriteMovieIds.Contains(m.Id))
                .ToListAsync();

            var favoriteGenres = new List<string>();
            foreach (var movie in favoriteMovies)
            {
                if (!string.IsNullOrEmpty(movie.Genre))
                {
                    var genres = movie.Genre.Split(',').Select(g => g.Trim());
                    favoriteGenres.AddRange(genres);
                }
            }

            var results = new List<Movie>();

            // 4. Si no hay géneros, devolver películas populares
            if (!favoriteGenres.Any())
            {
                var popularMovies = await _tmdbService.GetPopularMoviesAsync(1);
                return popularMovies.Take(20).ToList();
            }

            // 5. Obtener películas top-rated como recomendaciones
            try
            {
                var topRatedMovies = await _tmdbService.GetTopRatedMoviesAsync(1);
                foreach (var movie in topRatedMovies)
                {
                    // Evitar películas que ya están en favoritos
                    if (favoriteMovieIds.Contains(movie.Id)) continue;
                    
                    results.Add(movie);
                    if (results.Count >= 20) break;
                }
            }
            catch
            {
                // Si falla, intentar con películas populares
            }

            // 6. Si no tenemos suficientes, completar con películas populares
            if (results.Count < 20)
            {
                try
                {
                    var popularMovies = await _tmdbService.GetPopularMoviesAsync(1);
                    foreach (var movie in popularMovies)
                    {
                        if (favoriteMovieIds.Contains(movie.Id)) continue;
                        if (results.Any(r => r.TmdbId == movie.TmdbId)) continue;

                        results.Add(movie);
                        if (results.Count >= 20) break;
                    }
                }
                catch
                {
                    // Ignorar errores
                }
            }

            return results.Take(20);
        }
    }
}