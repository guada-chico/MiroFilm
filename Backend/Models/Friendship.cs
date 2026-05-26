using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Miro.Models
{
    public class Friendship
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserRequestId { get; set; }

        [Required]
        public int UserReceiveId { get; set; }

        // El estado puede ser: "Pending", "Accepted", "Declined"
        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Relaciones de navegación
        [ForeignKey("UserRequestId")]
        public virtual User? UserRequest { get; set; }

        [ForeignKey("UserReceiveId")]
        public virtual User? UserReceive { get; set; }
    }
}