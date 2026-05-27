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
            var results = new List<Movie>();

            try
            {
                // 1. Obtener las películas favoritas del usuario (usando TmdbMovieId)
                var favoriteTmdbIds = await _context.Favorites
                    .Where(f => f.UserId == userId && f.TmdbMovieId.HasValue)
                    .Select(f => f.TmdbMovieId.Value)
                    .ToListAsync();

                Console.WriteLine($"[RECOMENDACIONES] Usuario {userId} tiene {favoriteTmdbIds.Count} películas favoritas");

                // 2. Si el usuario no tiene películas favoritas, devolver películas populares
                if (!favoriteTmdbIds.Any())
                {
                    Console.WriteLine($"[RECOMENDACIONES] Sin favoritos, devolviendo películas populares");
                    for (int page = 1; page <= 2; page++)
                    {
                        var popularMovies = await _tmdbService.GetPopularMoviesAsync(page);
                        results.AddRange(popularMovies);
                        if (results.Count >= 20) break;
                    }
                    results = results.Take(20).ToList();
                    return results;
                }

                // 3. Obtener películas top-rated como recomendaciones
                try
                {
                    for (int page = 1; page <= 2; page++)
                    {
                        var topRatedMovies = await _tmdbService.GetTopRatedMoviesAsync(page);
                        foreach (var movie in topRatedMovies)
                        {
                            // Evitar películas que ya están en favoritos
                            if (favoriteTmdbIds.Contains(movie.TmdbId)) continue;
                            
                            results.Add(movie);
                            if (results.Count >= 20) break;
                        }
                        if (results.Count >= 20) break;
                    }
                    Console.WriteLine($"[RECOMENDACIONES] Películas top-rated: {results.Count}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[RECOMENDACIONES] Error obteniendo top-rated: {ex.Message}");
                }

                // 4. Si no tenemos suficientes, completar con películas populares
                if (results.Count < 20)
                {
                    try
                    {
                        for (int page = 1; page <= 2; page++)
                        {
                            var popularMovies = await _tmdbService.GetPopularMoviesAsync(page);
                            foreach (var movie in popularMovies)
                            {
                                if (favoriteTmdbIds.Contains(movie.TmdbId)) continue;
                                if (results.Any(r => r.TmdbId == movie.TmdbId)) continue;

                                results.Add(movie);
                                if (results.Count >= 20) break;
                            }
                            if (results.Count >= 20) break;
                        }
                        Console.WriteLine($"[RECOMENDACIONES] Películas populares añadidas: {results.Count}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[RECOMENDACIONES] Error obteniendo populares: {ex.Message}");
                    }
                }

                results = results.Take(20).ToList();
                Console.WriteLine($"[RECOMENDACIONES] Devolviendo {results.Count} películas en total");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RECOMENDACIONES] Error general: {ex.Message}");
            }

            return results;
        }

    }
}