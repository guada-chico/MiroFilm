using System.Text.Json.Serialization;

namespace Miro.Dto
{
    public class FavoriteDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("tmdbId")]
        public int? tmdbId { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("posterUrl")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? posterUrl { get; set; }

        [JsonPropertyName("director")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? director { get; set; }

        [JsonPropertyName("creator")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? creator { get; set; }

        [JsonPropertyName("genre")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? genre { get; set; }

        [JsonPropertyName("rating")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public double? rating { get; set; }

        [JsonPropertyName("plot")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? plot { get; set; }

        [JsonPropertyName("type")]
        public string type { get; set; } // "movie" o "series"
    }
}
