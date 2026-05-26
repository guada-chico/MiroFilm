namespace Miro.Models
{
    public class GutendexBook
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public List<string> Authors { get; set; } = new();
        public string? CoverUrl { get; set; }
        public string? ReadUrl { get; set; }
        public List<string> Languages { get; set; } = new();
        public int DownloadCount { get; set; }
    }
}
