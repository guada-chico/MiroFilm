
using Miro.Services.Interfaces;
using System.Text.Json;

namespace Miro.Services
{
    public class PrhBooksService : IPrhBooksService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        // Base URL de la API Enhanced de PRH
        private const string BaseUrl = "https://api.penguinrandomhouse.com/resources/v2/title/domains";

        public PrhBooksService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        private string ApiKey => _config["PenguinRandomHouse:ApiKey"] ?? "";
        private string Domain => _config["PenguinRandomHouse:Domain"] ?? "PRH.ES";

        // ── Novedades (últimos 180 días) ───────────────────────────────────────
        public async Task<IEnumerable<PrhBook>> GetNewReleasesAsync(int rows = 20)
        {
            // Usar búsqueda con filtro de fecha para novedades
            var sixMonthsAgo = DateTime.Now.AddMonths(-6).ToString("yyyy-MM-dd");
            var query = $"onsale:[{sixMonthsAgo} TO *]";
            var q = Uri.EscapeDataString(query);
            var url = BuildUrl($"{BaseUrl}/{Domain}/search",
                $"q={q}&rows={rows}&suppressRecordCount=true");

            return await FetchBooksAsync(url);
        }

        // ── Próximas publicaciones ─────────────────────────────────────────────
        public async Task<IEnumerable<PrhBook>> GetComingSoonAsync(int rows = 20)
        {
            // Buscar libros con fecha de venta en el futuro
            var today = DateTime.Now.ToString("yyyy-MM-dd");
            var query = $"onsale:[{today} TO *]";
            var q = Uri.EscapeDataString(query);
            var url = BuildUrl($"{BaseUrl}/{Domain}/search",
                $"q={q}&rows={rows}&suppressRecordCount=true");

            return await FetchBooksAsync(url);
        }

        // ── Búsqueda libre ─────────────────────────────────────────────────────
        public async Task<IEnumerable<PrhBook>> SearchAsync(string query, int rows = 20)
        {
            // NOTA: La búsqueda en PRH requiere acceso "Enhanced" o "Premium"
            // Si tu key no tiene acceso, devuelve lista vacía
            var q = Uri.EscapeDataString(query);
            var url = BuildUrl($"{BaseUrl}/{Domain}/search",
                $"q={q}&rows={rows}&suppressRecordCount=true");

            var results = await FetchBooksAsync(url);
            
            // Si no hay resultados, intenta con búsqueda por novedades como fallback
            if (!results.Any())
            {
                return await GetNewReleasesAsync(rows);
            }
            
            return results;
        }

        // ── Por categoría BISAC ────────────────────────────────────────────────
        public async Task<IEnumerable<PrhBook>> GetByCategoryAsync(string catUri, int rows = 20)
        {
            // Usar búsqueda con filtro de categoría
            var query = $"bisacCode:{Uri.EscapeDataString(catUri)}";
            var q = Uri.EscapeDataString(query);
            var url = BuildUrl($"{BaseUrl}/{Domain}/search",
                $"q={q}&rows={rows}&suppressRecordCount=true");

            return await FetchBooksAsync(url);
        }

        // ── Construcción de URL con api_key ────────────────────────────────────
        private string BuildUrl(string endpoint, string queryParams)
        {
            var separator = endpoint.Contains('?') ? "&" : "?";
            return $"{endpoint}{separator}{queryParams}&api_key={ApiKey}";
        }

        // ── Parser de respuesta ────────────────────────────────────────────────
        private async Task<IEnumerable<PrhBook>> FetchBooksAsync(string url)
        {
            try
            {
                var response = await _httpClient.GetAsync(url);

                // 403 = key no activada aún
                if (response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                    throw new InvalidOperationException("PRH API key not activated yet. Check developer.penguinrandomhouse.com.");

                if (!response.IsSuccessStatusCode)
                    return new List<PrhBook>();

                var content = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(content);

                var books = new List<PrhBook>();

                // La respuesta tiene estructura: { data: { works: [...] } }
                // o { data: { titles: [...] } } según el endpoint
                if (!doc.RootElement.TryGetProperty("data", out var data))
                    return books;

                // Intentar "works" primero, luego "titles", luego "results"
                JsonElement items;
                if (data.TryGetProperty("works", out items) ||
                    data.TryGetProperty("titles", out items) ||
                    data.TryGetProperty("results", out items))
                {
                    foreach (var item in items.EnumerateArray())
                    {
                        var book = ParseBook(item);
                        if (book != null) books.Add(book);
                    }
                }

                return books;
            }
            catch (InvalidOperationException)
            {
                throw; // Re-lanzar para que el controller lo capture
            }
            catch
            {
                return new List<PrhBook>();
            }
        }

        private PrhBook? ParseBook(JsonElement item)
        {
            try
            {
                // Título
                var title = item.TryGetProperty("title", out var t) ? t.GetString() : null;
                if (string.IsNullOrWhiteSpace(title)) return null;

                // Autor: puede estar en "authors" (array) o "author" (string)
                string author = "Autor desconocido";
                if (item.TryGetProperty("authors", out var authors) && authors.GetArrayLength() > 0)
                {
                    var first = authors[0];
                    var firstName = first.TryGetProperty("firstName", out var fn) ? fn.GetString() : "";
                    var lastName  = first.TryGetProperty("lastName",  out var ln) ? ln.GetString() : "";
                    author = $"{firstName} {lastName}".Trim();
                    if (string.IsNullOrWhiteSpace(author))
                        author = first.TryGetProperty("authorDisplay", out var ad) ? ad.GetString() ?? "Autor desconocido" : "Autor desconocido";
                }
                else if (item.TryGetProperty("authorDisplay", out var ad))
                {
                    author = ad.GetString() ?? "Autor desconocido";
                }

                // ISBN: preferimos isbn13
                string? isbn = null;
                if (item.TryGetProperty("isbn", out var isbnEl)) isbn = isbnEl.GetString();
                if (string.IsNullOrEmpty(isbn) && item.TryGetProperty("isbn13", out var isbn13El)) isbn = isbn13El.GetString();

                // Portada: PRH usa el patrón https://images.penguinrandomhouse.com/cover/{isbn}
                string? coverUrl = null;
                if (item.TryGetProperty("jacket", out var jacket))
                    coverUrl = jacket.GetString();
                else if (!string.IsNullOrEmpty(isbn))
                    coverUrl = $"https://images.penguinrandomhouse.com/cover/{isbn}";

                // Descripción
                string? description = null;
                if (item.TryGetProperty("description", out var desc)) description = desc.GetString();
                if (string.IsNullOrEmpty(description) && item.TryGetProperty("shortDescription", out var shortDesc))
                    description = shortDesc.GetString();

                // Sello editorial
                string? publisher = null;
                if (item.TryGetProperty("imprint", out var imp))
                    publisher = imp.TryGetProperty("description", out var impDesc) ? impDesc.GetString() : imp.GetString();

                // Fecha de venta
                string? onSaleDate = null;
                if (item.TryGetProperty("onsale", out var onsale)) onSaleDate = onsale.GetString();

                // Categoría
                string? category = null;
                if (item.TryGetProperty("categories", out var cats) && cats.GetArrayLength() > 0)
                    category = cats[0].TryGetProperty("description", out var catDesc) ? catDesc.GetString() : null;

                return new PrhBook
                {
                    Title      = title,
                    Author     = author,
                    Isbn       = isbn,
                    CoverUrl   = coverUrl,
                    Description = description,
                    Publisher  = publisher,
                    OnSaleDate = onSaleDate,
                    Category   = category,
                    Language   = "es"
                };
            }
            catch
            {
                return null;
            }
        }
    }
}
