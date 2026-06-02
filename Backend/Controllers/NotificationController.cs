using Miro.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Miro.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notifService;
        public NotificationController(INotificationService notifService) => _notifService = notifService;

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            // Si no hay ID en el token, devolvemos un 401 (No autorizado)
            if (userIdClaim == null) return Unauthorized("No se pudo identificar al usuario.");

            int userId = int.Parse(userIdClaim.Value);
            var notifications = await _notifService.GetMyNotesAsync(userId);

            return Ok(notifications);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var success = await _notifService.MarkAsReadAsync(id);
            return success ? Ok() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var success = await _notifService.DeleteNotificationAsync(id);
            return success ? Ok() : NotFound();
        }
    }
}