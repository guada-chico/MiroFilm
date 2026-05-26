using Miro.Services.Interfaces;

namespace Miro.Services
{
    public class OpenLibraryService : IOpenLibraryService
    {
        private readonly HttpClient _httpClient;

        public OpenLibraryService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string?> GetHighResCoverUrlAsync(string isbn)
        {
            if (string.IsNullOrWhiteSpace(isbn)) return null;

            // La API de portadas de Open Library funciona directamente por URL
            // 'L' es para Large (Grande), 'M' para Medium.
            string coverUrl = $"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg?default=false";

            // Verificamos si la imagen existe realmente
            var response = await _httpClient.SendAsync(new HttpRequestMessage(HttpMethod.Head, coverUrl));

            return response.IsSuccessStatusCode ? coverUrl : null;
        }
    }
}