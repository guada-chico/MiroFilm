using Miro.Models;

namespace Miro.Services.Interfaces
{
    public interface IFavoritesService
    {
        Task<bool> ToggleFavoriteAsync(int userId, int bookId);
        Task<IEnumerable<Book>> GetUserFavoritesAsync(int userId);
    }
}