using Miro.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Miro.Controllers
{
    [Authorize] // Obliga a que el usuario esté logueado para usar estos endpoints
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : ControllerBase
    {
        private readonly IFavoritesService _favService;

        // Inyectamos la interfaz 
        public FavoritesController(IFavoritesService favService)
        {
            _favService = favService;
        }

        /// Acción del "Corazón": Si no existe lo crea, si existe lo borra con POST
  
        [HttpPost("toggle/{bookId}")]
        public async Task<IActionResult> ToggleFavorite(int bookId)
        {
            // Extraemos el ID del usuario directamente desde el Token JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                return Unauthorized("No se pudo identificar al usuario.");

            int userId = int.Parse(userIdClaim.Value);

            // Llamamos al servicio para hacer el "switch"
            // result será true si se añadió, false si se eliminó
            bool isFavorite = await _favService.ToggleFavoriteAsync(userId, bookId);

            return Ok(new
            {
                Message = isFavorite ? "Añadido a favoritos" : "Eliminado de favoritos",
                IsFavorite = isFavorite
            });
        }

        /// Obtiene todos los libros favoritos del usuario actual.
        [HttpGet]
        public async Task<IActionResult> GetMyFavorites()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            // Llamamos al servicio corregido
            var favorites = await _favService.GetUserFavoritesAsync(userId);

            return Ok(favorites);
        }
    }
}