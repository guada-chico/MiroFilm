namespace Miro.Dto
{
    public class FriendActivityDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = "";
        public string? AvatarUrl { get; set; }
        public string ActivityType { get; set; } = ""; // "movie", "series", "book"
        public string ContentTitle { get; set; } = "";
        public string? ContentPosterUrl { get; set; }
        public DateTime ActivityDate { get; set; }
        public string ActivityDescription { get; set; } = ""; // "agregó a favoritos", "está viendo", etc.
    }
}
