namespace Miro.Dto
{
    public class FavoriteDto
    {
        public int Id { get; set; }
        public int? TmdbMovieId { get; set; }
        public int? TmdbSeriesId { get; set; }
        public string Title { get; set; }
        public string? PosterUrl { get; set; }
        public string? Director { get; set; }
        public string? Creator { get; set; }
        public string? Genre { get; set; }
        public double? Rating { get; set; }
        public string? Plot { get; set; }
        public string Type { get; set; } // "movie" o "series"
    }
}
