using Miro.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Miro.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReadingController : ControllerBase
    {
        private readonly IReadingService _readingService;

        public ReadingController(IReadingService readingService)
        {
            _readingService = readingService;
        }

        [HttpPost("update-status")]
        public async Task<IActionResult> UpdateStatus(int bookId, string status, int currentPage)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);

            // Asegúrate de que tu interfaz IReadingService acepte estos 4 parámetros
            var success = await _readingService.UpdateStatusAsync(userId, bookId, status, currentPage);

            return success ? Ok("Estado y página actualizados") : BadRequest();
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentReading()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);

            var current = await _readingService.GetCurrentReadingAsync(userId);

            if (current == null) return NotFound("No hay ninguna lectura activa.");

            return Ok(current);
        }

        [HttpGet("my-library")]
        public async Task<IActionResult> GetLibrary()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var library = await _readingService.GetUserLibraryAsync(userId);

            return Ok(library);
        }
    }
}