using System.ComponentModel.DataAnnotations.Schema;

namespace Miro.Models
{
    public class WatchingStatus
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int MovieId { get; set; }
        public string Status { get; set; } = "Pendiente";  // Pendiente, Viendo, Completada
        public int CurrentMinute { get; set; } = 0;

        public User? User { get; set; }
        public Movie? Movie { get; set; }

        // Propiedad calculada "al vuelo"
        [NotMapped]
        public int ProgressPercentage
        {
            get
            {
                if (Movie == null || Movie.Duration == 0) return 0;
                return (CurrentMinute * 100) / Movie.Duration;
            }
        }
    }
}
