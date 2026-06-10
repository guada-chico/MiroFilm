using Miro.Models;

namespace Miro.Services.Interfaces
{
    public interface IFavoritesService
    {
        Task<List<Favorite>> GetUserFavoritesAsync(int userId);
        Task<List<Favorite>> GetUserMovieFavoritesAsync(int userId);
        Task<List<Favorite>> GetUserSeriesFavoritesAsync(int userId);
        Task<Favorite?> AddFavoriteAsync(int userId, int? movieId, int? seriesId, int? tmdbMovieId, int? tmdbSeriesId);
        Task<bool> RemoveFavoriteAsync(int userId, int? movieId, int? seriesId);
        Task<bool> IsFavoriteAsync(int userId, int? movieId, int? seriesId);
    }
}