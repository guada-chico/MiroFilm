using Miro.Models;
using Miro.Services.Interfaces;
using System.Text.Json;

namespace Miro.Services
{
    public class GoogleBookService : IGoogleBookService
    {
        private readonly HttpClient _httpClient;
        private const string BaseUrl = "https://www.googleapis.com/books/v1/volumes";

        public GoogleBookService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        // ── Búsqueda libre (sin filtro de idioma) ──────────────────────────────
        public async Task<IEnumerable<Book>> SearchBooksAsync(string query)
        {
            var url = $"{BaseUrl}?q={Uri.EscapeDataString(query)}&maxResults=20&langRestrict=es";
            return await FetchBooksAsync(url);
        }

        // ── Recomendaciones actuales en español ────────────────────────────────
        public async Task<IEnumerable<Book>> GetSpanishRecommendationsAsync(string genre = "novela")
        {
            // Mapa de queries optimizadas por género para Google Books en español
            var genreQueries = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["novela"]          = "novela española 2024 OR 2023",
                ["thriller"]        = "thriller policiaco español novela",
                ["romance"]         = "novela romantica española 2023 OR 2024",
                ["fantasia"]        = "fantasia epica novela español",
                ["ciencia ficcion"] = "ciencia ficcion español novela 2023 OR 2024",
                ["historia"]        = "novela historica española 2023 OR 2024",
                ["biografia"]       = "autobiografia vida español",
                ["autoayuda"]       = "autoayuda superacion personal español",
                ["infantil"]        = "literatura infantil español 2024",
            };

            var queryText = genreQueries.TryGetValue(genre, out var mapped) ? mapped : $"{genre} novela español";
            var query = Uri.EscapeDataString(queryText);
            var url = $"{BaseUrl}?q={query}&langRestrict=es&orderBy=newest&maxResults=20&printType=books";
            return await FetchBooksAsync(url);
        }

        // Clásicos conocidos: buscamos obras icónicas de la literatura en español
        public async Task<IEnumerable<Book>> GetSpanishClassicsAsync()
        {
            var query = Uri.EscapeDataString("Don Quijote Cervantes OR García Márquez OR Borges OR Neruda OR Lorca OR Vargas Llosa");
            var url = $"{BaseUrl}?q={query}&langRestrict=es&orderBy=relevance&maxResults=20&printType=books";
            return await FetchBooksAsync(url);
        }

        // ── Método privado compartido ──────────────────────────────────────────
        private async Task<IEnumerable<Book>> FetchBooksAsync(string url)
        {
            // Hasta 3 intentos con espera exponencial para manejar rate limiting de Google
            for (int attempt = 1; attempt <= 3; attempt++)
            {
                try
                {
                    var response = await _httpClient.GetAsync(url);

                    if (response.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable)
                    {
                        if (attempt < 3) await Task.Delay(attempt * 800);
                        continue;
                    }

                    if (!response.IsSuccessStatusCode) return new List<Book>();

                    var content = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(content);
                    var books = new List<Book>();

                    if (!doc.RootElement.TryGetProperty("items", out var items))
                        return books;

                    foreach (var item in items.EnumerateArray())
                    {
                        if (!item.TryGetProperty("volumeInfo", out var info)) continue;

                        // Extraer ISBN
                        string? foundIsbn = null;
                        if (info.TryGetProperty("industryIdentifiers", out var identifiers))
                        {
                            foreach (var id in identifiers.EnumerateArray())
                            {
                                var type = id.GetProperty("type").GetString();
                                if (type == "ISBN_13" || type == "ISBN_10")
                                {
                                    foundIsbn = id.GetProperty("identifier").GetString();
                                    if (type == "ISBN_13") break;
                                }
                            }
                        }

                        // Portada: preferimos thumbnail grande
                        string? imageUrl = null;
                        if (info.TryGetProperty("imageLinks", out var imgs))
                        {
                            if (imgs.TryGetProperty("thumbnail", out var thumb))
                                imageUrl = thumb.GetString()?.Replace("http://", "https://");
                            else if (imgs.TryGetProperty("smallThumbnail", out var small))
                                imageUrl = small.GetString()?.Replace("http://", "https://");
                        }

                        books.Add(new Book
                        {
                            Title    = info.TryGetProperty("title", out var t) ? t.GetString() ?? "Sin título" : "Sin título",
                            Author   = info.TryGetProperty("authors", out var a) && a.GetArrayLength() > 0
                                       ? a[0].GetString() ?? "Autor desconocido" : "Autor desconocido",
                            Isbn     = foundIsbn,
                            Synopsis = info.TryGetProperty("description", out var d) ? d.GetString() : null,
                            TotalPages = info.TryGetProperty("pageCount", out var p) ? p.GetInt32() : 0,
                            Category = info.TryGetProperty("categories", out var c) && c.GetArrayLength() > 0
                                       ? c[0].GetString() : null,
                            ImageUrl = imageUrl
                        });
                    }

                    return books;
                }
                catch
                {
                    if (attempt == 3) return new List<Book>();
                    await Task.Delay(attempt * 800);
                }
            }

            return new List<Book>();
        }
    }
}