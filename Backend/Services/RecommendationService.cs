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

            var results = new List<Movie>();

            // 2. Si el usuario no tiene películas favoritas, devolver películas populares
            if (!favoriteMovieIds.Any())
            {
                // Obtener 3 páginas de películas populares (20 por página = 60 total)
                for (int page = 1; page <= 3; page++)
                {
                    var popularMovies = await _tmdbService.GetPopularMoviesAsync(page);
                    results.AddRange(popularMovies);
                    if (results.Count >= 60) break;
                }
                results = results.Take(60).ToList();
                Console.WriteLine($"[RECOMENDACIONES] Sin favoritos - Devolviendo {results.Count} películas populares");
                return results;
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

            // 4. Si no hay géneros, devolver películas populares
            if (!favoriteGenres.Any())
            {
                // Obtener 3 páginas de películas populares
                for (int page = 1; page <= 3; page++)
                {
                    var popularMovies = await _tmdbService.GetPopularMoviesAsync(page);
                    results.AddRange(popularMovies);
                    if (results.Count >= 60) break;
                }
                results = results.Take(60).ToList();
                Console.WriteLine($"[RECOMENDACIONES] Sin géneros - Devolviendo {results.Count} películas populares");
                return results;
            }

            // 5. Obtener películas top-rated como recomendaciones
            try
            {
                for (int page = 1; page <= 3; page++)
                {
                    var topRatedMovies = await _tmdbService.GetTopRatedMoviesAsync(page);
                    foreach (var movie in topRatedMovies)
                    {
                        // Evitar películas que ya están en favoritos
                        if (favoriteMovieIds.Contains(movie.Id)) continue;
                        
                        results.Add(movie);
                        if (results.Count >= 60) break;
                    }
                    if (results.Count >= 60) break;
                }
            }
            catch
            {
                // Si falla, intentar con películas populares
            }

            // 6. Si no tenemos suficientes, completar con películas populares
            if (results.Count < 60)
            {
                try
                {
                    for (int page = 1; page <= 3; page++)
                    {
                        var popularMovies = await _tmdbService.GetPopularMoviesAsync(page);
                        foreach (var movie in popularMovies)
                        {
                            if (favoriteMovieIds.Contains(movie.Id)) continue;
                            if (results.Any(r => r.TmdbId == movie.TmdbId)) continue;

                            results.Add(movie);
                            if (results.Count >= 60) break;
                        }
                        if (results.Count >= 60) break;
                    }
                }
                catch
                {
                    // Ignorar errores
                }
            }

            // Enriquecer todas las películas con detalles (director, géneros, etc.)
            var enrichedResults = await EnrichMoviesWithDetailsAsync(results);
            
            var finalCount = enrichedResults.Count();
            Console.WriteLine($"[RECOMENDACIONES] Devolviendo {finalCount} películas en total (enriquecidas)");
            return enrichedResults;
        }

        private async Task<IEnumerable<Movie>> EnrichMoviesWithDetailsAsync(List<Movie> movies)
        {
            var enrichedMovies = new List<Movie>();
            
            // Procesar en paralelo pero con límite de concurrencia para no sobrecargar TMDb
            var semaphore = new System.Threading.SemaphoreSlim(5); // Máximo 5 llamadas simultáneas
            
            var tasks = movies.Select(async movie =>
            {
                await semaphore.WaitAsync();
                try
                {
                    var details = await _tmdbService.GetMovieDetailsAsync(movie.TmdbId);
                    return details ?? movie;
                }
                catch
                {
                    return movie;
                }
                finally
                {
                    semaphore.Release();
                }
            });

            var results = await Task.WhenAll(tasks);
            return results.ToList();
        }
    }
}