using Miro.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationsController : ControllerBase
    {
        private readonly IRecommendationService _recService;

        public RecommendationsController(IRecommendationService recService)
        {
            _recService = recService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetMyRecommendations()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            
            // Si el usuario está autenticado, devolver recomendaciones personalizadas
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                var recommendations = await _recService.GetRecommendationsAsync(userId);
                return Ok(recommendations);
            }

            // Si no está autenticado, devolver películas populares
            return Ok(new List<object>());
        }

        [HttpGet("series")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMySeriesRecommendations()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            
            // Si el usuario está autenticado, devolver recomendaciones personalizadas
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                var recommendations = await _recService.GetSeriesRecommendationsAsync(userId);
                return Ok(recommendations);
            }

            // Si no está autenticado, devolver series populares
            return Ok(new List<object>());
        }
    }
}