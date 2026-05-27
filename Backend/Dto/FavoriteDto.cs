using System.Text.Json.Serialization;

namespace Miro.Dto
{
    public class FavoriteDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("tmdbId")]
        public int? TmdbId { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("posterUrl")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? PosterUrl { get; set; }

        [JsonPropertyName("director")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Director { get; set; }

        [JsonPropertyName("creator")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Creator { get; set; }

        [JsonPropertyName("genre")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Genre { get; set; }

        [JsonPropertyName("rating")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public double? Rating { get; set; }

        [JsonPropertyName("plot")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Plot { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; } // "movie" o "series"
    }
}
