using Miro.Data;
using Miro.Models;
using Microsoft.EntityFrameworkCore;

namespace Miro.Services
{
    public class SeriesService : ISeriesService
    {
        private readonly AppDbContext _context;

        public SeriesService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Series>> GetAllSeriesAsync()
        {
            return await _context.Series.ToListAsync();
        }

        public async Task<Series?> GetSeriesByIdAsync(int id)
        {
            return await _context.Series.FindAsync(id);
        }

        public async Task<Series> AddSeriesAsync(Series series)
        {
            _context.Series.Add(series);
            await _context.SaveChangesAsync();
            return series;
        }

        public async Task<Series?> UpdateSeriesAsync(int id, Series series)
        {
            var existingSeries = await _context.Series.FindAsync(id);
            if (existingSeries == null)
                return null;

            existingSeries.Title = series.Title;
            existingSeries.Creator = series.Creator;
            existingSeries.Plot = series.Plot;
            existingSeries.PosterUrl = series.PosterUrl;
            existingSeries.BackdropUrl = series.BackdropUrl;
            existingSeries.NumberOfSeasons = series.NumberOfSeasons;
            existingSeries.NumberOfEpisodes = series.NumberOfEpisodes;
            existingSeries.Genre = series.Genre;
            existingSeries.Rating = series.Rating;
            existingSeries.FirstAirDate = series.FirstAirDate;
            existingSeries.LastAirDate = series.LastAirDate;
            existingSeries.Language = series.Language;
            existingSeries.Status = series.Status;

            await _context.SaveChangesAsync();
            return existingSeries;
        }

        public async Task<bool> DeleteSeriesAsync(int id)
        {
            var series = await _context.Series.FindAsync(id);
            if (series == null)
                return false;

            _context.Series.Remove(series);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
