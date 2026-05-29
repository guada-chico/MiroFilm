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

            // Validar que no sea el mismo usuario
            if (senderId == receiverId)
                return BadRequest(new { message = "No puedes agregarte a ti mismo como amigo." });

            // Llamamos al servicio corregido
            var success = await _friendshipService.SendRequestAsync(senderId, receiverId);

            if (!success)
                return BadRequest(new { message = "Ya existe una solicitud de amistad con este usuario. Verifica tus solicitudes pendientes." });

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
            
            // Construir URLs completas para avatares
            var friendsWithUrls = friends.Select(f => new
            {
                f.Id,
                f.UserRequestId,
                f.UserReceiveId,
                f.Status,
                f.CreatedAt,
                userRequest = f.UserRequest != null ? new
                {
                    f.UserRequest.Id,
                    f.UserRequest.Name,
                    f.UserRequest.Email,
                    avatarUrl = string.IsNullOrEmpty(f.UserRequest.AvatarUrl) ? null : 
                        (f.UserRequest.AvatarUrl.StartsWith("http") ? f.UserRequest.AvatarUrl : 
                        $"{Request.Scheme}://{Request.Host}{f.UserRequest.AvatarUrl}")
                } : null,
                userReceive = f.UserReceive != null ? new
                {
                    f.UserReceive.Id,
                    f.UserReceive.Name,
                    f.UserReceive.Email,
                    avatarUrl = string.IsNullOrEmpty(f.UserReceive.AvatarUrl) ? null : 
                        (f.UserReceive.AvatarUrl.StartsWith("http") ? f.UserReceive.AvatarUrl : 
                        $"{Request.Scheme}://{Request.Host}{f.UserReceive.AvatarUrl}")
                } : null
            }).ToList();
            
            return Ok(friendsWithUrls);
        }

        /// Obtiene las solicitudes de amistad pendientes recibidas.
        [HttpGet("pending-requests")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var requests = await _friendshipService.GetPendingRequestsAsync(userId);
            
            // Construir URLs completas para avatares
            var requestsWithUrls = requests.Select(f => new
            {
                f.Id,
                f.UserRequestId,
                f.UserReceiveId,
                f.Status,
                f.CreatedAt,
                userRequest = f.UserRequest != null ? new
                {
                    f.UserRequest.Id,
                    f.UserRequest.Name,
                    f.UserRequest.Email,
                    avatarUrl = string.IsNullOrEmpty(f.UserRequest.AvatarUrl) ? null : 
                        (f.UserRequest.AvatarUrl.StartsWith("http") ? f.UserRequest.AvatarUrl : 
                        $"{Request.Scheme}://{Request.Host}{f.UserRequest.AvatarUrl}")
                } : null,
                userReceive = f.UserReceive != null ? new
                {
                    f.UserReceive.Id,
                    f.UserReceive.Name,
                    f.UserReceive.Email,
                    avatarUrl = string.IsNullOrEmpty(f.UserReceive.AvatarUrl) ? null : 
                        (f.UserReceive.AvatarUrl.StartsWith("http") ? f.UserReceive.AvatarUrl : 
                        $"{Request.Scheme}://{Request.Host}{f.UserReceive.AvatarUrl}")
                } : null
            }).ToList();
            
            return Ok(requestsWithUrls);
        }

        /// Obtiene las solicitudes de amistad pendientes enviadas.
        [HttpGet("sent-requests")]
        public async Task<IActionResult> GetSentRequests()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var requests = await _friendshipService.GetSentRequestsAsync(userId);
            
            // Construir URLs completas para avatares
            var requestsWithUrls = requests.Select(f => new
            {
                f.Id,
                f.UserRequestId,
                f.UserReceiveId,
                f.Status,
                f.CreatedAt,
                userRequest = f.UserRequest != null ? new
                {
                    f.UserRequest.Id,
                    f.UserRequest.Name,
                    f.UserRequest.Email,
                    avatarUrl = string.IsNullOrEmpty(f.UserRequest.AvatarUrl) ? null : 
                        (f.UserRequest.AvatarUrl.StartsWith("http") ? f.UserRequest.AvatarUrl : 
                        $"{Request.Scheme}://{Request.Host}{f.UserRequest.AvatarUrl}")
                } : null,
                userReceive = f.UserReceive != null ? new
                {
                    f.UserReceive.Id,
                    f.UserReceive.Name,
                    f.UserReceive.Email,
                    avatarUrl = string.IsNullOrEmpty(f.UserReceive.AvatarUrl) ? null : 
                        (f.UserReceive.AvatarUrl.StartsWith("http") ? f.UserReceive.AvatarUrl : 
                        $"{Request.Scheme}://{Request.Host}{f.UserReceive.AvatarUrl}")
                } : null
            }).ToList();
            
            return Ok(requestsWithUrls);
        }

        /// Busca usuarios por nombre o email.
        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("La búsqueda no puede estar vacía.");

            var users = await _friendshipService.SearchUsersAsync(query);
            
            // Construir URLs completas para avatares
            var usersWithUrls = users.Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                avatarUrl = string.IsNullOrEmpty(u.AvatarUrl) ? null : 
                    (u.AvatarUrl.StartsWith("http") ? u.AvatarUrl : 
                    $"{Request.Scheme}://{Request.Host}{u.AvatarUrl}")
            }).ToList();
            
            return Ok(usersWithUrls);
        }

        /// Obtiene información de un usuario específico.
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUser(int userId)
        {
            var user = await _friendshipService.GetUserByIdAsync(userId);

            if (user == null)
                return NotFound("Usuario no encontrado.");

            var userWithUrl = new
            {
                user.Id,
                user.Name,
                user.Email,
                avatarUrl = string.IsNullOrEmpty(user.AvatarUrl) ? null : 
                    (user.AvatarUrl.StartsWith("http") ? user.AvatarUrl : 
                    $"{Request.Scheme}://{Request.Host}{user.AvatarUrl}")
            };

            return Ok(userWithUrl);
        }

        /// Cancela una solicitud de amistad enviada.
        [HttpDelete("cancel-request/{friendshipId}")]
        public async Task<IActionResult> CancelRequest(int friendshipId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var success = await _friendshipService.CancelRequestAsync(friendshipId, userId);

            if (!success)
                return BadRequest("No se pudo cancelar la solicitud. Verifica que sea una solicitud pendiente enviada por ti.");

            return Ok(new { message = "Solicitud cancelada correctamente." });
        }

        /// Obtiene el estado de amistad entre dos usuarios.
        [HttpGet("status/{otherUserId}")]
        public async Task<IActionResult> GetFriendshipStatus(int otherUserId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var friendship = await _friendshipService.GetFriendshipStatusAsync(userId, otherUserId);

            if (friendship == null)
                return Ok(new { status = "none" });

            return Ok(new { status = friendship.Status, friendshipId = friendship.Id });
        }
    }
}