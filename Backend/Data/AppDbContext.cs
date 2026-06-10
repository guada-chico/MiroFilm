using Miro.Models;
using Microsoft.EntityFrameworkCore;

namespace Miro.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Movie> Movies => Set<Movie>();
        public DbSet<Series> Series => Set<Series>();
        public DbSet<Favorite> Favorites => Set<Favorite>();
        public DbSet<WatchingStatus> WatchingStatuses { get; set; }
        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Evitar borrado en cascada circular para Friendships
            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.UserRequest)
                .WithMany()
                .HasForeignKey(f => f.UserRequestId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.UserReceive)
                .WithMany()
                .HasForeignKey(f => f.UserReceiveId)
                .OnDelete(DeleteBehavior.Restrict);

           

            // Seed Data de Películas
            modelBuilder.Entity<Movie>().HasData(
                new Movie { Id = 1, TmdbId = 278, Title = "The Shawshank Redemption", Director = "Frank Darabont", Genre = "Drama", Duration = 142, Rating = 9.3, ReleaseDate = new DateTime(1994, 10, 14) },
                new Movie { Id = 2, TmdbId = 238, Title = "The Godfather", Director = "Francis Ford Coppola", Genre = "Crime, Drama", Duration = 175, Rating = 9.2, ReleaseDate = new DateTime(1972, 3, 24) },
                new Movie { Id = 3, TmdbId = 240, Title = "The Godfather Part II", Director = "Francis Ford Coppola", Genre = "Crime, Drama", Duration = 202, Rating = 9.0, ReleaseDate = new DateTime(1974, 12, 20) }
            );

            // Seed Data de Series
            modelBuilder.Entity<Series>().HasData(
                new Series { Id = 1, TmdbId = 1399, Title = "Breaking Bad", Creator = "Vince Gilligan", Genre = "Crime, Drama, Thriller", NumberOfSeasons = 5, NumberOfEpisodes = 62, Rating = 9.5, FirstAirDate = new DateTime(2008, 1, 20), LastAirDate = new DateTime(2013, 9, 29), Status = "Ended", Language = "en", PosterUrl = "https://image.tmdb.org/t/p/w500/ggJZtGjWsIHe4R1IY93gXvnWEYH.jpg", Plot = "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's financial future." },
                new Series { Id = 2, TmdbId = 1668, Title = "Friends", Creator = "David Crane, Marta Kauffman", Genre = "Comedy, Romance", NumberOfSeasons = 10, NumberOfEpisodes = 236, Rating = 8.9, FirstAirDate = new DateTime(1994, 9, 22), LastAirDate = new DateTime(2004, 5, 6), Status = "Ended", Language = "en", PosterUrl = "https://image.tmdb.org/t/p/w500/f496cm9sPdJjIB9yalMQWXKc5Gg.jpg", Plot = "Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in the New York City borough of Manhattan." },
                new Series { Id = 3, TmdbId = 1396, Title = "The Crown", Creator = "Peter Morgan", Genre = "Biography, Drama, History", NumberOfSeasons = 5, NumberOfEpisodes = 50, Rating = 8.6, FirstAirDate = new DateTime(2016, 11, 4), LastAirDate = new DateTime(2022, 11, 14), Status = "Ended", Language = "en", PosterUrl = "https://image.tmdb.org/t/p/w500/lFSIGwDSapQj1vRsPGQUVcKcsxh.jpg", Plot = "Follows the political rivalries and romance of Queen Elizabeth II, and the events that shaped the second half of the twentieth century." },
                new Series { Id = 4, TmdbId = 1402, Title = "The Office", Creator = "Greg Daniels", Genre = "Comedy", NumberOfSeasons = 9, NumberOfEpisodes = 201, Rating = 9.0, FirstAirDate = new DateTime(2005, 3, 24), LastAirDate = new DateTime(2013, 5, 16), Status = "Ended", Language = "en", PosterUrl = "https://image.tmdb.org/t/p/w500/wSp8gG1dCOo6dBvXSnoow6CaAdb.jpg", Plot = "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium." },
                new Series { Id = 5, TmdbId = 1407, Title = "Stranger Things", Creator = "The Duffer Brothers", Genre = "Drama, Fantasy, Horror", NumberOfSeasons = 4, NumberOfEpisodes = 42, Rating = 8.7, FirstAirDate = new DateTime(2016, 7, 15), LastAirDate = new DateTime(2022, 7, 1), Status = "Ended", Language = "en", PosterUrl = "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", Plot = "When a young boy disappears, his friends, family and local police uncover a mystery involving secret government experiments, terrifying supernatural forces and a strange little girl." },
                new Series { Id = 6, TmdbId = 1418, Title = "Game of Thrones", Creator = "David Benioff, D. B. Weiss", Genre = "Action, Adventure, Drama", NumberOfSeasons = 8, NumberOfEpisodes = 73, Rating = 9.2, FirstAirDate = new DateTime(2011, 4, 17), LastAirDate = new DateTime(2019, 5, 19), Status = "Ended", Language = "en", PosterUrl = "https://image.tmdb.org/t/p/w500/u3bZgnEu2PAok7onUZdPiT6inVt.jpg", Plot = "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia." }
            );
        }
    }
}