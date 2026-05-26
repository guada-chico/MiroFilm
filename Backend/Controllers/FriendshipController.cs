using Miro.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Miro.Controllers
{
    [Authorize] // Protege todos los endpoints: solo usuarios logueados
    [ApiController]
    [Route("api/[controller]")]
    public class FriendshipController : ControllerBase
    {
        private readonly IFriendshipService _friendshipService;

        public FriendshipController(IFriendshipService friendshipService)
        {
            _friendshipService = friendshipService;
        }

        /// Envía una solicitud de amistad a otro usuario.
        [HttpPost("request/{receiverId}")]
        public async Task<IActionResult> SendRequest(int receiverId)
        {
            // Obtenemos el ID del usuario que envía (desde el Token)
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int senderId = int.Parse(userIdClaim.Value);

            // Llamamos al servicio corregido
            var success = await _friendshipService.SendRequestAsync(senderId, receiverId);

            if (!success)
                return BadRequest("No se pudo enviar la solicitud. Es posible que ya exista una relación o estés intentando agregarte a ti mismo.");

            return Ok(new { message = "Solicitud de amistad enviada con éxito." });
        }

        /// Responde a una solicitud (Aceptar o Rechazar).
     
        [HttpPut("respond/{friendshipId}")]
        public async Task<IActionResult> Respond(int friendshipId, [FromQuery] string status)
        {
            // Validamos que el status sea uno de los permitidos
            if (status != "Accepted" && status != "Rejected")
            {
                return BadRequest("El estado debe ser 'Accepted' o 'Rejected'.");
            }

            var success = await _friendshipService.RespondToRequestAsync(friendshipId, status);

            if (!success) return NotFound("No se encontró la solicitud de amistad.");

            return Ok(new { message = $"Solicitud {status} correctamente." });
        }

        /// Obtiene la lista de amigos (solo aceptados).
       
        [HttpGet("my-friends")]
        public async Task<IActionResult> GetMyFriends()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var friends = await _friendshipService.GetUserFriendsAsync(userId);
            return Ok(friends);
        }
    }
}