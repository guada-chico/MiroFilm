using Miro.Models;
using Microsoft.EntityFrameworkCore;

namespace Miro.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Book> Books => Set<Book>();
        public DbSet<Movie> Movies => Set<Movie>();
        public DbSet<Favorite> Favorites => Set<Favorite>();
        public DbSet<ReadingStatus> ReadingStatuses { get; set; }
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

            // Seed Data de Libros
            modelBuilder.Entity<Book>().HasData(
                new Book { Id = 1, Title = "El Hobbit", Author = "J.R.R. Tolkien", Category = "Fantasía" },
                new Book { Id = 2, Title = "Neuromante", Author = "William Gibson", Category = "Ciencia Ficción" },
                new Book { Id = 3, Title = "Cien años de soledad", Author = "Gabriel García Márquez", Category = "Realismo Mágico" }
            );

            // Seed Data de Películas
            modelBuilder.Entity<Movie>().HasData(
                new Movie { Id = 1, TmdbId = 278, Title = "The Shawshank Redemption", Director = "Frank Darabont", Genre = "Drama", Duration = 142, Rating = 9.3, ReleaseDate = new DateTime(1994, 10, 14) },
                new Movie { Id = 2, TmdbId = 238, Title = "The Godfather", Director = "Francis Ford Coppola", Genre = "Crime, Drama", Duration = 175, Rating = 9.2, ReleaseDate = new DateTime(1972, 3, 24) },
                new Movie { Id = 3, TmdbId = 240, Title = "The Godfather Part II", Director = "Francis Ford Coppola", Genre = "Crime, Drama", Duration = 202, Rating = 9.0, ReleaseDate = new DateTime(1974, 12, 20) }
            );
        }
    }
}