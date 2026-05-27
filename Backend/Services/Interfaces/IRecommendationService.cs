using Miro.Models;

namespace Miro.Services.Interfaces
{
    public interface IRecommendationService
    {
        // Obtiene películas recomendadas basadas en los favoritos del usuario
        Task<IEnumerable<Movie>> GetRecommendationsAsync(int userId);

        // Obtiene series recomendadas basadas en los favoritos del usuario
        Task<IEnumerable<Series>> GetSeriesRecommendationsAsync(int userId);
    }
}
