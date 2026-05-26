using Miro.Services.Interfaces;
using Miro.Models;
using System.Text.Json;

namespace Miro.Services
{
    public class GutendexService : IGutendexService
    {
        private readonly HttpClient _httpClient;
        private const string BaseUrl = "https://gutendex.com/books";

        public GutendexService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<IEnumerable<GutendexBook>> SearchBooksAsync(string query)
        {
            // Buscar sin filtro de idioma para obtener más resultados
            var url = $"{BaseUrl}?search={Uri.EscapeDataString(query)}";
            var results = await FetchBooks(url);
            Console.WriteLine($"[GutendexService] Búsqueda '{query}': {results.Count()} resultados encontrados");
            return results;
        }

        public async Task<IEnumerable<GutendexBook>> GetTopBooksAsync(int count = 20)
        {
            // Estrategia: obtener libros populares sin filtro de idioma
            // Gutendex ordena por descargas por defecto
            var books = new List<GutendexBook>();
            int page = 1;
            int maxPages = 3; // Limitar a 3 páginas
            
            while (books.Count < count && page <= maxPages)
            {
                var url = $"{BaseUrl}?page={page}";
                var pageBooks = await FetchBooks(url);
                
                if (!pageBooks.Any()) break;
                
                books.AddRange(pageBooks);
                page++;
            }
            
            // Si no encontramos libros en español, devolver los que tenemos
            return books.Take(count);
        }

        public async Task<IEnumerable<GutendexBook>> GetBooksByPageAsync(int page = 1)
        {
            // Devolver exactamente 20 libros por página
            var url = $"{BaseUrl}?page={page}";
            var allBooks = await FetchBooks(url);
            return allBooks.Take(20);
        }

        private async Task<IEnumerable<GutendexBook>> FetchBooks(string url)
        {
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode) return new List<GutendexBook>();

            var content = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(content);

            var books = new List<GutendexBook>();

            if (!doc.RootElement.TryGetProperty("results", out var results))
                return books;

            foreach (var item in results.EnumerateArray())
            {
                // Extraer idiomas
                var languages = new List<string>();
                if (item.TryGetProperty("languages", out var langsArr))
                {
                    foreach (var lang in langsArr.EnumerateArray())
                        languages.Add(lang.GetString() ?? "");
                }

                // Extraer autores
                var authors = new List<string>();
                if (item.TryGetProperty("authors", out var authorsArr))
                {
                    foreach (var author in authorsArr.EnumerateArray())
                    {
                        if (author.TryGetProperty("name", out var name))
                            authors.Add(name.GetString() ?? "");
                    }
                }

                // Extraer portada
                string? coverUrl = null;
                if (item.TryGetProperty("formats", out var formats))
                {
                    if (formats.TryGetProperty("image/jpeg", out var cover))
                        coverUrl = cover.GetString();
                }

                // Extraer URL de lectura (preferimos HTML, luego texto plano)
                string? readUrl = null;
                if (item.TryGetProperty("formats", out var fmts))
                {
                    // Intentamos HTML primero (mejor experiencia de lectura)
                    if (fmts.TryGetProperty("text/html", out var html))
                        readUrl = html.GetString();
                    else if (fmts.TryGetProperty("text/plain; charset=utf-8", out var txt))
                        readUrl = txt.GetString();
                    else if (fmts.TryGetProperty("text/plain; charset=us-ascii", out var ascii))
                        readUrl = ascii.GetString();
                }

                books.Add(new GutendexBook
                {
                    Id = item.TryGetProperty("id", out var id) ? id.GetInt32() : 0,
                    Title = item.TryGetProperty("title", out var title) ? title.GetString() ?? "Sin título" : "Sin título",
                    Authors = authors,
                    CoverUrl = coverUrl,
                    ReadUrl = readUrl,
                    Languages = languages,
                    DownloadCount = item.TryGetProperty("download_count", out var dl) ? dl.GetInt32() : 0
                });
            }

            return books;
        }
    }
}
