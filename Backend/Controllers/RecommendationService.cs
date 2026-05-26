using Miro.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Miro.Controllers
{
    [Authorize]
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
        public async Task<IActionResult> GetMyRecommendations()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);
            var recommendations = await _recService.GetRecommendationsAsync(userId);

            return Ok(recommendations);
        }
    }
}