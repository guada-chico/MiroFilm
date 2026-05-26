namespace Miro.Models
{
    public class Favorite
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int? BookId { get; set; }  // Nullable para soportar películas
        public int? MovieId { get; set; }  // Nuevo para películas

        // Estas propiedades permiten hacer el .Include(f => f.Book) en el controlador
        public User? User { get; set; }
        public Book? Book { get; set; }
        public Movie? Movie { get; set; }
    }
}
