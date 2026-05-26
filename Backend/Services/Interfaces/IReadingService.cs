using Miro.Models;

namespace Miro.Services.Interfaces
{
    public interface IReadingService
    {
        Task<ReadingStatus?> GetCurrentReadingAsync(int userId);

        Task<bool> UpdateStatusAsync(int userId, int bookId, string status, int currentPage);

        Task<IEnumerable<ReadingStatus>> GetUserLibraryAsync(int userId);
    }
}