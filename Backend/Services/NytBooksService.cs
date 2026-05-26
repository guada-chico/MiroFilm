using Miro.Services.Interfaces;
using System.Text.Json;

namespace Miro.Services
{
    public class NytBooksService : INytBooksService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private const string NytBaseUrl    = "https://api.nytimes.com/svc/books/v3/lists/current";
        private const string GoogleBooksUrl = "https://www.googleapis.com/books/v1/volumes";
        private const string MyMemoryUrl    = "https://api.mymemory.translated.net/get";

        public NytBooksService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        public async Task<IEnumerable<NytBook>> GetBestSellersAsync(string listName = "hardcover-fiction")
        {
            var apiKey = _config["NytBooks:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey) || apiKey == "TU_API_KEY_AQUI")
                return new List<NytBook>();

            var url = $"{NytBaseUrl}/{listName}.json?api-key={apiKey}";
            try
            {
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode) return new List<NytBook>();

                var content = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(content);

                if (!doc.RootElement.TryGetProperty("results", out var results)) return new List<NytBook>();
                if (!results.TryGetProperty("books", out var booksArray)) return new List<NytBook>();

                var rawBooks = new List<NytBook>();
                foreach (var item in booksArray.EnumerateArray())
                {
                    string? isbn = null;
                    if (item.TryGetProperty("primary_isbn13", out var isbn13) && isbn13.GetString() != "0000000000000")
                        isbn = isbn13.GetString();
                    else if (item.TryGetProperty("primary_isbn10", out var isbn10))
                        isbn = isbn10.GetString();

                    var englishTitle = item.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
                    var englishDesc  = item.TryGetProperty("description", out var d) ? d.GetString() ?? "" : "";

                    rawBooks.Add(new NytBook
                    {
                        OriginalTitle       = englishTitle,
                        Title               = englishTitle,
                        Author              = item.TryGetProperty("author", out var a) ? a.GetString() ?? "" : "",
                        Description         = englishDesc,
                        OriginalDescription = englishDesc,
                        CoverUrl            = item.TryGetProperty("book_image", out var img) ? img.GetString() : null,
                        AmazonUrl           = item.TryGetProperty("amazon_product_url", out var amz) ? amz.GetString() : null,
                        Rank                = item.TryGetProperty("rank", out var rank) ? rank.GetInt32() : 0,
                        WeeksOnList         = item.TryGetProperty("weeks_on_list", out var weeks) ? weeks.GetInt32() : 0,
                        Isbn                = isbn,
                        HasSpanishVersion   = false
                    });
                }

                var semaphore = new SemaphoreSlim(5);
                await Task.WhenAll(rawBooks.Select(async book =>
                {
                    await semaphore.WaitAsync();
                    try   { await EnrichWithSpanishAsync(book); }
                    finally { semaphore.Release(); }
                }));

                return rawBooks;
            }
            catch { return new List<NytBook>(); }
        }

        private async Task EnrichWithSpanishAsync(NytBook book)
        {
            try
            {
                var query    = Uri.EscapeDataString($"{book.OriginalTitle} {book.Author}");
                var gbUrl    = $"{GoogleBooksUrl}?q={query}&langRestrict=es&maxResults=3&orderBy=relevance";
                var response = await _httpClient.GetAsync(gbUrl);

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(content);

                    if (doc.RootElement.TryGetProperty("items", out var items) && items.GetArrayLength() > 0)
                    {
                        var info = items[0].GetProperty("volumeInfo");
                        if (info.TryGetProperty("language", out var lang) && lang.GetString() == "es")
                        {
                            if (info.TryGetProperty("title", out var esTitle) && !string.IsNullOrWhiteSpace(esTitle.GetString()))
                                book.Title = esTitle.GetString()!;
                            if (info.TryGetProperty("description", out var esDesc) && !string.IsNullOrWhiteSpace(esDesc.GetString()))
                                book.Description = esDesc.GetString()!;
                            if (info.TryGetProperty("imageLinks", out var imgs))
                            {
                                var cover = imgs.TryGetProperty("thumbnail", out var th) ? th.GetString() :
                                            imgs.TryGetProperty("smallThumbnail", out var sm) ? sm.GetString() : null;
                                if (!string.IsNullOrWhiteSpace(cover))
                                    book.CoverUrl = cover!.Replace("http://", "https://");
                            }
                            book.HasSpanishVersion = true;
                            return;
                        }
                    }
                }
            }
            catch { }

            var translatedTitle = await TranslateAsync(book.OriginalTitle);
            if (!string.IsNullOrWhiteSpace(translatedTitle)) book.Title = translatedTitle;

            if (!string.IsNullOrWhiteSpace(book.OriginalDescription))
            {
                var translatedDesc = await TranslateAsync(book.OriginalDescription);
                if (!string.IsNullOrWhiteSpace(translatedDesc)) book.Description = translatedDesc;
            }
            book.HasSpanishVersion = true;
        }

        private async Task<string?> TranslateAsync(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return text;
            var truncated = text.Length > 500 ? text[..500] : text;
            try
            {
                var encoded = Uri.EscapeDataString(truncated);
                var url     = $"{MyMemoryUrl}?q={encoded}&langpair=en|es";
                var email   = _config["MyMemory:Email"];
                if (!string.IsNullOrWhiteSpace(email)) url += $"&de={Uri.EscapeDataString(email)}";

                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode) return null;

                var content = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(content);

                if (doc.RootElement.TryGetProperty("responseData", out var data) &&
                    data.TryGetProperty("translatedText", out var translated))
                {
                    var result = translated.GetString();
                    return result?.StartsWith("QUERY LENGTH") == true ? null : result;
                }
            }
            catch { }
            return null;
        }
    }
}