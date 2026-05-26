using Miro.Models;
using Miro.Services.Interfaces;
using System.Text.Json;

namespace Miro.Services
{
    public class TmdbService : ITmdbService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly string _apiKey;
        private readonly string _baseUrl;

        public TmdbService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _apiKey = _configuration["TmdbApi:ApiKey"] ?? throw new InvalidOperationException("TMDb API key not configured");
            _baseUrl = _configuration["TmdbApi:BaseUrl"] ?? "https://api.themoviedb.org/3";
        }

        public async Task<IEnumerable<Movie>> SearchMoviesAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return Enumerable.Empty<Movie>();

            try
            {
                var url = $"{_baseUrl}/search/movie?api_key={_apiKey}&query={Uri.EscapeDataString(query)}&language=es-ES";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(content);
                var results = jsonDoc.RootElement.GetProperty("results");

                return ParseMovies(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error searching movies: {ex.Message}");
                return Enumerable.Empty<Movie>();
            }
        }

        public async Task<IEnumerable<Movie>> GetPopularMoviesAsync(int page = 1)
        {
            try
            {
                var url = $"{_baseUrl}/movie/popular?api_key={_apiKey}&language=es-ES&page={page}";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(content);
                var results = jsonDoc.RootElement.GetProperty("results");

                return ParseMovies(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting popular movies: {ex.Message}");
                return Enumerable.Empty<Movie>();
            }
        }

        public async Task<IEnumerable<Movie>> GetTopRatedMoviesAsync(int page = 1)
        {
            try
            {
                var url = $"{_baseUrl}/movie/top_rated?api_key={_apiKey}&language=es-ES&page={page}";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(content);
                var results = jsonDoc.RootElement.GetProperty("results");

                return ParseMovies(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting top rated movies: {ex.Message}");
                return Enumerable.Empty<Movie>();
            }
        }

        public async Task<IEnumerable<Movie>> GetUpcomingMoviesAsync(int page = 1)
        {
            try
            {
                var url = $"{_baseUrl}/movie/upcoming?api_key={_apiKey}&language=es-ES&page={page}";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(content);
                var results = jsonDoc.RootElement.GetProperty("results");

                return ParseMovies(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting upcoming movies: {ex.Message}");
                return Enumerable.Empty<Movie>();
            }
        }

        public async Task<IEnumerable<Movie>> GetNowPlayingMoviesAsync(int page = 1)
        {
            try
            {
                var url = $"{_baseUrl}/movie/now_playing?api_key={_apiKey}&language=es-ES&page={page}";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(content);
                var results = jsonDoc.RootElement.GetProperty("results");

                return ParseMovies(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting now playing movies: {ex.Message}");
                return Enumerable.Empty<Movie>();
            }
        }

        public async Task<IEnumerable<Movie>> GetMoviesByGenreAsync(int genreId, int page = 1)
        {
            try
            {
                var url = $"{_baseUrl}/discover/movie?api_key={_apiKey}&language=es-ES&with_genres={genreId}&page={page}";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(content);
                var results = jsonDoc.RootElement.GetProperty("results");

                return ParseMovies(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting movies by genre: {ex.Message}");
                return Enumerable.Empty<Movie>();
            }
        }

        public async Task<Movie?> GetMovieDetailsAsync(int tmdbId)
        {
            try
            {
                var url = $"{_baseUrl}/movie/{tmdbId}?api_key={_apiKey}&language=es-ES&append_to_response=credits";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(content);

                return ParseMovieDetail(jsonDoc.RootElement);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting movie details: {ex.Message}");
                return null;
            }
        }

        private List<Movie> ParseMovies(JsonElement results)
        {
            var movies = new List<Movie>();

            foreach (var item in results.EnumerateArray())
            {
                var movie = new Movie
                {
                    TmdbId = item.GetProperty("id").GetInt32(),
                    Title = item.GetProperty("title").GetString() ?? string.Empty,
                    Plot = item.TryGetProperty("overview", out var overview) ? overview.GetString() : null,
                    PosterUrl = item.TryGetProperty("poster_path", out var poster) && poster.ValueKind != JsonValueKind.Null
                        ? $"https://image.tmdb.org/t/p/w500{poster.GetString()}"
                        : null,
                    BackdropUrl = item.TryGetProperty("backdrop_path", out var backdrop) && backdrop.ValueKind != JsonValueKind.Null
                        ? $"https://image.tmdb.org/t/p/w1280{backdrop.GetString()}"
                        : null,
                    Rating = item.TryGetProperty("vote_average", out var rating) ? rating.GetDouble() : null,
                    ReleaseDate = item.TryGetProperty("release_date", out var releaseDate) && releaseDate.ValueKind != JsonValueKind.Null
                        ? DateTime.TryParse(releaseDate.GetString(), out var date) ? date : null
                        : null,
                    Language = item.TryGetProperty("original_language", out var lang) ? lang.GetString() : null
                };

                movies.Add(movie);
            }

            return movies;
        }

        private Movie ParseMovieDetail(JsonElement element)
        {
            var genres = new List<string>();
            if (element.TryGetProperty("genres", out var genresArray))
            {
                foreach (var genre in genresArray.EnumerateArray())
                {
                    if (genre.TryGetProperty("name", out var genreName))
                    {
                        genres.Add(genreName.GetString() ?? string.Empty);
                    }
                }
            }

            // Obtener director de los créditos
            var director = "Director desconocido";
            if (element.TryGetProperty("credits", out var credits) && credits.TryGetProperty("crew", out var crew))
            {
                foreach (var crewMember in crew.EnumerateArray())
                {
                    if (crewMember.TryGetProperty("job", out var job) && job.GetString() == "Director")
                    {
                        if (crewMember.TryGetProperty("name", out var name))
                        {
                            director = name.GetString() ?? "Director desconocido";
                            break;
                        }
                    }
                }
            }

            var movie = new Movie
            {
                TmdbId = element.GetProperty("id").GetInt32(),
                Title = element.GetProperty("title").GetString() ?? string.Empty,
                Plot = element.TryGetProperty("overview", out var overview) ? overview.GetString() : null,
                PosterUrl = element.TryGetProperty("poster_path", out var poster) && poster.ValueKind != JsonValueKind.Null
                    ? $"https://image.tmdb.org/t/p/w500{poster.GetString()}"
                    : null,
                BackdropUrl = element.TryGetProperty("backdrop_path", out var backdrop) && backdrop.ValueKind != JsonValueKind.Null
                    ? $"https://image.tmdb.org/t/p/w1280{backdrop.GetString()}"
                    : null,
                Duration = element.TryGetProperty("runtime", out var runtime) ? runtime.GetInt32() : 0,
                Rating = element.TryGetProperty("vote_average", out var rating) ? rating.GetDouble() : null,
                ReleaseDate = element.TryGetProperty("release_date", out var releaseDate) && releaseDate.ValueKind != JsonValueKind.Null
                    ? DateTime.TryParse(releaseDate.GetString(), out var date) ? date : null
                    : null,
                Genre = string.Join(", ", genres),
                Language = element.TryGetProperty("original_language", out var lang) ? lang.GetString() : null,
                Director = director
            };

            return movie;
        }

        public async Task<IEnumerable<Series>> SearchSeriesAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return Enumerable.Empty<Series>();

            try
            {
                var url = $"{_baseUrl}/search/tv?api_key={_apiKey}&query={Uri.EscapeDataString(query)}&language=es-ES";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(content);
                var results = jsonDoc.RootElement.GetProperty("results");

                return ParseSeries(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error searching series: {ex.Message}");
                return Enumerable.Empty<Series>();
            }
        }

        public async Task<IEnumerable<Series>> GetPopularSeriesAsync(int page = 1)
        {
            try
            {
                var url = $"{_baseUrl}/tv/popular?api_key={_apiKey}&language=es-ES&page={page}";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(content);
                var results = jsonDoc.RootElement.GetProperty("results");

                return ParseSeries(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting popular series: {ex.Message}");
                return Enumerable.Empty<Series>();
            }
        }

        public async Task<IEnumerable<Series>> GetTopRatedSeriesAsync(int page = 1)
        {
            try
            {
                var url = $"{_baseUrl}/tv/top_rated?api_key={_apiKey}&language=es-ES&page={page}";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(content);
                var results = jsonDoc.RootElement.GetProperty("results");

                return ParseSeries(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting top rated series: {ex.Message}");
                return Enumerable.Empty<Series>();
            }
        }

        public async Task<Series?> GetSeriesDetailsAsync(int tmdbId)
        {
            try
            {
                var url = $"{_baseUrl}/tv/{tmdbId}?api_key={_apiKey}&language=es-ES&append_to_response=credits";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(content);

                return ParseSeriesDetail(jsonDoc.RootElement);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting series details: {ex.Message}");
                return null;
            }
        }

        private List<Series> ParseSeries(JsonElement results)
        {
            var seriesList = new List<Series>();

            foreach (var item in results.EnumerateArray())
            {
                var series = new Series
                {
                    TmdbId = item.GetProperty("id").GetInt32(),
                    Title = item.GetProperty("name").GetString() ?? string.Empty,
                    Plot = item.TryGetProperty("overview", out var overview) ? overview.GetString() : null,
                    PosterUrl = item.TryGetProperty("poster_path", out var poster) && poster.ValueKind != JsonValueKind.Null
                        ? $"https://image.tmdb.org/t/p/w500{poster.GetString()}"
                        : null,
                    BackdropUrl = item.TryGetProperty("backdrop_path", out var backdrop) && backdrop.ValueKind != JsonValueKind.Null
                        ? $"https://image.tmdb.org/t/p/w1280{backdrop.GetString()}"
                        : null,
                    Rating = item.TryGetProperty("vote_average", out var rating) ? rating.GetDouble() : null,
                    FirstAirDate = item.TryGetProperty("first_air_date", out var firstAirDate) && firstAirDate.ValueKind != JsonValueKind.Null
                        ? DateTime.TryParse(firstAirDate.GetString(), out var date) ? date : null
                        : null,
                    Language = item.TryGetProperty("original_language", out var lang) ? lang.GetString() : null
                };

                seriesList.Add(series);
            }

            return seriesList;
        }

        private Series ParseSeriesDetail(JsonElement element)
        {
            var genres = new List<string>();
            if (element.TryGetProperty("genres", out var genresArray))
            {
                foreach (var genre in genresArray.EnumerateArray())
                {
                    if (genre.TryGetProperty("name", out var genreName))
                    {
                        genres.Add(genreName.GetString() ?? string.Empty);
                    }
                }
            }

            // Obtener creador de los créditos
            var creator = "Creador desconocido";
            if (element.TryGetProperty("created_by", out var createdByArray))
            {
                foreach (var createdBy in createdByArray.EnumerateArray())
                {
                    if (createdBy.TryGetProperty("name", out var name))
                    {
                        creator = name.GetString() ?? "Creador desconocido";
                        break;
                    }
                }
            }

            var series = new Series
            {
                TmdbId = element.GetProperty("id").GetInt32(),
                Title = element.GetProperty("name").GetString() ?? string.Empty,
                Plot = element.TryGetProperty("overview", out var overview) ? overview.GetString() : null,
                PosterUrl = element.TryGetProperty("poster_path", out var poster) && poster.ValueKind != JsonValueKind.Null
                    ? $"https://image.tmdb.org/t/p/w500{poster.GetString()}"
                    : null,
                BackdropUrl = element.TryGetProperty("backdrop_path", out var backdrop) && backdrop.ValueKind != JsonValueKind.Null
                    ? $"https://image.tmdb.org/t/p/w1280{backdrop.GetString()}"
                    : null,
                NumberOfSeasons = element.TryGetProperty("number_of_seasons", out var seasons) ? seasons.GetInt32() : null,
                NumberOfEpisodes = element.TryGetProperty("number_of_episodes", out var episodes) ? episodes.GetInt32() : null,
                Rating = element.TryGetProperty("vote_average", out var rating) ? rating.GetDouble() : null,
                FirstAirDate = element.TryGetProperty("first_air_date", out var firstAirDate) && firstAirDate.ValueKind != JsonValueKind.Null
                    ? DateTime.TryParse(firstAirDate.GetString(), out var firstDate) ? firstDate : null
                    : null,
                LastAirDate = element.TryGetProperty("last_air_date", out var lastAirDate) && lastAirDate.ValueKind != JsonValueKind.Null
                    ? DateTime.TryParse(lastAirDate.GetString(), out var lastDate) ? lastDate : null
                    : null,
                Genre = string.Join(", ", genres),
                Language = element.TryGetProperty("original_language", out var lang) ? lang.GetString() : null,
                Status = element.TryGetProperty("status", out var status) ? status.GetString() : null,
                Creator = creator
            };

            return series;
        }
    }
}
