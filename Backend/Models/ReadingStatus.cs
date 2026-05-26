using System.ComponentModel.DataAnnotations.Schema;

namespace Miro.Models
{
    public class ReadingStatus
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BookId { get; set; }
        public string Status { get; set; } = "Pendiente";
        public int CurrentPage { get; set; } = 0;

        public User? User { get; set; }
        public Book? Book { get; set; }

        // Propiedad calculada "al vuelo"
        [NotMapped]
        public int ProgressPercentage
        {
            get
            {
                if (Book == null || Book.TotalPages == 0) return 0;
                return (CurrentPage * 100) / Book.TotalPages;
            }
        }
    }
}