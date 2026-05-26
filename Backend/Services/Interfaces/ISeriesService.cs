using Miro.Models;

namespace Miro.Services
{
    public interface ISeriesService
    {
        Task<IEnumerable<Series>> GetAllSeriesAsync();
        Task<Series?> GetSeriesByIdAsync(int id);
        Task<Series> AddSeriesAsync(Series series);
        Task<Series?> UpdateSeriesAsync(int id, Series series);
        Task<bool> DeleteSeriesAsync(int id);
    }
}
