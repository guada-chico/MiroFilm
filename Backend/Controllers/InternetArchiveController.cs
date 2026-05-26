using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InternetArchiveController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private const string IA_API_BASE = "https://archive.org/advancedsearch.php";

        public InternetArchiveController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        /// <summary>
        /// Busca películas y series gratuitas en Internet Archive.
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] int rows = 20)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest("La consulta no puede estar vacía.");

            try
            {
                // Construir query para buscar videos (películas/series)
                var query = $"(mediatype:movies OR mediatype:video) AND ({q})";
                var url = $"{IA_API_BASE}?q={Uri.EscapeDataString(query)}&fl=identifier,title,description,creator,date,avg_rating,downloads&output=json&rows={rows}";

                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(content);
                var docs = jsonDoc.RootElement.GetProperty("response").GetProperty("docs");

                var results = new List<dynamic>();
                foreach (var doc in docs.EnumerateArray())
                {
                    results.Add(new
                    {
                        id = doc.GetProperty("identifier").GetString(),
                        title = doc.GetProperty("title").GetString(),
                        description = doc.TryGetProperty("description", out var desc) ? desc.GetString() : "",
                        creator = doc.TryGetProperty("creator", out var creator) ? creator.GetString() : "Unknown",
                        date = doc.TryGetProperty("date", out var date) ? date.GetString() : "",
                        rating = doc.TryGetProperty("avg_rating", out var rating) ? rating.GetDouble() : 0,
                        downloads = doc.TryGetProperty("downloads", out var downloads) ? downloads.GetInt32() : 0,
                        watchUrl = $"https://archive.org/details/{doc.GetProperty("identifier").GetString()}"
                    });
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al buscar en Internet Archive", details = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene películas clásicas populares de Internet Archive.
        /// </summary>
        [HttpGet("classics")]
        public async Task<IActionResult> GetClassics([FromQuery] int rows = 20)
        {
            try
            {
                // Buscar películas clásicas (películas antiguas con buena puntuación)
                var query = "mediatype:movies AND (year:[1900 TO 1960]) AND avg_rating:[3 TO 5]";
                var url = $"{IA_API_BASE}?q={Uri.EscapeDataString(query)}&fl=identifier,title,description,creator,date,avg_rating,downloads&output=json&rows={rows}&sort=avg_rating+desc";

                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(content);
                var docs = jsonDoc.RootElement.GetProperty("response").GetProperty("docs");

                var results = new List<dynamic>();
                foreach (var doc in docs.EnumerateArray())
                {
                    results.Add(new
                    {
                        id = doc.GetProperty("identifier").GetString(),
                        title = doc.GetProperty("title").GetString(),
                        description = doc.TryGetProperty("description", out var desc) ? desc.GetString() : "",
                        creator = doc.TryGetProperty("creator", out var creator) ? creator.GetString() : "Unknown",
                        date = doc.TryGetProperty("date", out var date) ? date.GetString() : "",
                        rating = doc.TryGetProperty("avg_rating", out var rating) ? rating.GetDouble() : 0,
                        downloads = doc.TryGetProperty("downloads", out var downloads) ? downloads.GetInt32() : 0,
                        watchUrl = $"https://archive.org/details/{doc.GetProperty("identifier").GetString()}",
                        posterUrl = $"https://archive.org/services/get_item_image.php?identifier={doc.GetProperty("identifier").GetString()}"
                    });
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al obtener clásicos de Internet Archive", details = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene series de TV gratuitas de Internet Archive.
        /// </summary>
        [HttpGet("series")]
        public async Task<IActionResult> GetSeries([FromQuery] int rows = 20)
        {
            try
            {
                // Buscar series de TV
                var query = "mediatype:movies AND (collection:opensource_movies OR collection:community_video) AND (series OR tv OR episode)";
                var url = $"{IA_API_BASE}?q={Uri.EscapeDataString(query)}&fl=identifier,title,description,creator,date,avg_rating,downloads&output=json&rows={rows}&sort=downloads+desc";

                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(content);
                var docs = jsonDoc.RootElement.GetProperty("response").GetProperty("docs");

                var results = new List<dynamic>();
                foreach (var doc in docs.EnumerateArray())
                {
                    results.Add(new
                    {
                        id = doc.GetProperty("identifier").GetString(),
                        title = doc.GetProperty("title").GetString(),
                        description = doc.TryGetProperty("description", out var desc) ? desc.GetString() : "",
                        creator = doc.TryGetProperty("creator", out var creator) ? creator.GetString() : "Unknown",
                        date = doc.TryGetProperty("date", out var date) ? date.GetString() : "",
                        rating = doc.TryGetProperty("avg_rating", out var rating) ? rating.GetDouble() : 0,
                        downloads = doc.TryGetProperty("downloads", out var downloads) ? downloads.GetInt32() : 0,
                        watchUrl = $"https://archive.org/details/{doc.GetProperty("identifier").GetString()}",
                        posterUrl = $"https://archive.org/services/get_item_image.php?identifier={doc.GetProperty("identifier").GetString()}"
                    });
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al obtener series de Internet Archive", details = ex.Message });
            }
        }
    }
}
