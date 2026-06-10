using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Miro.Services.Interfaces;
using System.Security.Claims;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/recommendations")]
    public class RecommendationsController : ControllerBase
    {
        private readonly IRecommendationService _recommendationService;

        public RecommendationsController(IRecommendationService recommendationService)
        {
            _recommendationService = recommendationService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetRecommendations()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("No se pudo identificar al usuario.");

            int userId = int.Parse(userIdClaim.Value);
            var recs = await _recommendationService.GetRecommendationsAsync(userId);
            return Ok(recs);
        }

        [HttpGet("/api/recommendations/series")]
        [HttpGet("series")]
        [Authorize]
        public async Task<IActionResult> GetSeriesRecommendations()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("No se pudo identificar al usuario.");

            int userId = int.Parse(userIdClaim.Value);
            var recs = await _recommendationService.GetSeriesRecommendationsAsync(userId);
            return Ok(recs);
        }
    }
}
