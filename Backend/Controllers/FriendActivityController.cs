using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Miro.Data;
using Miro.Dto;
using System.Security.Claims;

namespace Miro.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/friend-activity")]
    public class FriendActivityController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FriendActivityController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtiene la actividad reciente de los amigos del usuario (películas, series y libros favoritos).
        /// </summary>
        [HttpGet("recent")]
        public async Task<IActionResult> GetFriendsActivity()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            // Obtener amigos aceptados
            var friendIds = await _context.Friendships
                .Where(f => (f.UserRequestId == userId || f.UserReceiveId == userId) && f.Status == "Accepted")
                .Select(f => f.UserRequestId == userId ? f.UserReceiveId : f.UserRequestId)
                .ToListAsync();

            if (!friendIds.Any())
                return Ok(new List<FriendActivityDto>());

            var activities = new List<FriendActivityDto>();

            // Obtener películas favoritas recientes de amigos
            var movieFavorites = await _context.Favorites
                .Where(f => friendIds.Contains(f.UserId) && f.TmdbMovieId.HasValue)
                .Include(f => f.User)
                .OrderByDescending(f => f.Id) // Ordenar por más recientes
                .Take(50)
                .ToListAsync();

            foreach (var fav in movieFavorites)
            {
                var movie = await _context.Movies
                    .FirstOrDefaultAsync(m => m.TmdbId == fav.TmdbMovieId.Value);

                if (movie != null && fav.User != null)
                {
                    activities.Add(new FriendActivityDto
                    {
                        UserId = fav.UserId,
                        UserName = fav.User.Name,
                        AvatarUrl = fav.User.AvatarUrl,
                        ActivityType = "movie",
                        ContentTitle = movie.Title,
                        ContentPosterUrl = movie.PosterUrl,
                        ActivityDate = DateTime.Now, // Idealmente guardaríamos la fecha en Favorite
                        ActivityDescription = "agregó a favoritos"
                    });
                }
            }

            // Obtener series favoritas recientes de amigos
            var seriesFavorites = await _context.Favorites
                .Where(f => friendIds.Contains(f.UserId) && f.TmdbSeriesId.HasValue)
                .Include(f => f.User)
                .OrderByDescending(f => f.Id)
                .Take(50)
                .ToListAsync();

            foreach (var fav in seriesFavorites)
            {
                var series = await _context.Series
                    .FirstOrDefaultAsync(s => s.TmdbId == fav.TmdbSeriesId.Value);

                if (series != null && fav.User != null)
                {
                    activities.Add(new FriendActivityDto
                    {
                        UserId = fav.UserId,
                        UserName = fav.User.Name,
                        AvatarUrl = fav.User.AvatarUrl,
                        ActivityType = "series",
                        ContentTitle = series.Title,
                        ContentPosterUrl = series.PosterUrl,
                        ActivityDate = DateTime.Now,
                        ActivityDescription = "agregó a favoritos"
                    });
                }
            }

            // Obtener películas que están viendo
            var watchingMovies = await _context.WatchingStatuses
                .Where(w => friendIds.Contains(w.UserId) && w.Status == "Viendo")
                .Include(w => w.User)
                .Include(w => w.Movie)
                .OrderByDescending(w => w.Id)
                .Take(50)
                .ToListAsync();

            foreach (var watching in watchingMovies)
            {
                if (watching.User != null && watching.Movie != null)
                {
                    activities.Add(new FriendActivityDto
                    {
                        UserId = watching.UserId,
                        UserName = watching.User.Name,
                        AvatarUrl = watching.User.AvatarUrl,
                        ActivityType = "movie",
                        ContentTitle = watching.Movie.Title,
                        ContentPosterUrl = watching.Movie.PosterUrl,
                        ActivityDate = DateTime.Now,
                        ActivityDescription = $"está viendo ({watching.ProgressPercentage}%)"
                    });
                }
            }

            // Ordenar por fecha más reciente
            var sortedActivities = activities
                .OrderByDescending(a => a.ActivityDate)
                .Take(20)
                .ToList();

            return Ok(sortedActivities);
        }

        /// <summary>
        /// Obtiene los favoritos de un amigo específico.
        /// </summary>
        [HttpGet("friend-favorites/{friendId}")]
        public async Task<IActionResult> GetFriendFavorites(int friendId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            // Verificar que son amigos
            var areFriends = await _context.Friendships
                .AnyAsync(f => (f.UserRequestId == userId && f.UserReceiveId == friendId ||
                               f.UserRequestId == friendId && f.UserReceiveId == userId) &&
                               f.Status == "Accepted");

            if (!areFriends)
                return Forbid("No eres amigo de este usuario.");

            var favorites = await _context.Favorites
                .Where(f => f.UserId == friendId && (f.TmdbMovieId.HasValue || f.TmdbSeriesId.HasValue))
                .ToListAsync();

            var result = new List<object>();

            foreach (var f in favorites)
            {
                if (f.TmdbMovieId.HasValue)
                {
                    var movie = await _context.Movies
                        .FirstOrDefaultAsync(m => m.TmdbId == f.TmdbMovieId.Value);

                    if (movie != null)
                    {
                        result.Add(new
                        {
                            id = f.Id,
                            tmdbId = f.TmdbMovieId,
                            title = movie.Title,
                            posterUrl = movie.PosterUrl,
                            director = movie.Director,
                            genre = movie.Genre,
                            rating = movie.Rating,
                            type = "movie"
                        });
                    }
                }
                else if (f.TmdbSeriesId.HasValue)
                {
                    var series = await _context.Series
                        .FirstOrDefaultAsync(s => s.TmdbId == f.TmdbSeriesId.Value);

                    if (series != null)
                    {
                        result.Add(new
                        {
                            id = f.Id,
                            tmdbId = f.TmdbSeriesId,
                            title = series.Title,
                            posterUrl = series.PosterUrl,
                            creator = series.Creator,
                            genre = series.Genre,
                            rating = series.Rating,
                            type = "series"
                        });
                    }
                }
            }

            return Ok(result);
        }

        /// <summary>
        /// Obtiene lo que está viendo un amigo.
        /// </summary>
        [HttpGet("friend-watching/{friendId}")]
        public async Task<IActionResult> GetFriendWatching(int friendId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            // Verificar que son amigos
            var areFriends = await _context.Friendships
                .AnyAsync(f => (f.UserRequestId == userId && f.UserReceiveId == friendId ||
                               f.UserRequestId == friendId && f.UserReceiveId == userId) &&
                               f.Status == "Accepted");

            if (!areFriends)
                return Forbid("No eres amigo de este usuario.");

            var watching = await _context.WatchingStatuses
                .Where(w => w.UserId == friendId && w.Status == "Viendo")
                .Include(w => w.Movie)
                .ToListAsync();

            var result = watching.Select(w => new
            {
                id = w.Id,
                movieId = w.MovieId,
                title = w.Movie?.Title,
                posterUrl = w.Movie?.PosterUrl,
                progress = w.ProgressPercentage,
                currentMinute = w.CurrentMinute,
                duration = w.Movie?.Duration
            }).ToList();

            return Ok(result);
        }

        /// <summary>
        /// Obtiene las películas y series que un amigo ha marcado como "Visto".
        /// </summary>
        [HttpGet("friend-watched/{friendId}")]
        public async Task<IActionResult> GetFriendWatched(int friendId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            // Verificar que son amigos
            var areFriends = await _context.Friendships
                .AnyAsync(f => (f.UserRequestId == userId && f.UserReceiveId == friendId ||
                               f.UserRequestId == friendId && f.UserReceiveId == userId) &&
                               f.Status == "Accepted");

            if (!areFriends)
                return Forbid("No eres amigo de este usuario.");

            var watched = await _context.WatchingStatuses
                .Where(w => w.UserId == friendId && w.Status == "Visto")
                .Include(w => w.Movie)
                .Include(w => w.Series)
                .ToListAsync();

            var result = new List<object>();

            foreach (var w in watched)
            {
                if (w.MovieId.HasValue && w.Movie != null)
                {
                    result.Add(new
                    {
                        id = w.Id,
                        tmdbId = w.Movie.TmdbId,
                        title = w.Movie.Title,
                        posterUrl = w.Movie.PosterUrl,
                        type = "movie",
                        watchedAt = w.UpdatedAt
                    });
                }
                else if (w.SeriesId.HasValue && w.Series != null)
                {
                    result.Add(new
                    {
                        id = w.Id,
                        tmdbId = w.Series.TmdbId,
                        title = w.Series.Title,
                        posterUrl = w.Series.PosterUrl,
                        type = "series",
                        watchedAt = w.UpdatedAt
                    });
                }
            }

            return Ok(result);
        }
    }
}
