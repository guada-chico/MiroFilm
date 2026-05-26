using Miro.Models;
using Miro.Dto; // <--- Importante para reconocer tus DTOs
using Miro.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserDto request)
        {
            // El ModelState.IsValid se comprueba automáticamente por el [ApiController]

            var user = new User
            {
                Name = request.Name, // Mapeamos Name a Username
                Email = request.Email
            };

            var result = await _authService.RegisterUserAsync(user, request.Password);
            if (result == null) return BadRequest("El usuario ya existe.");

            return Ok(new { message = "Registro exitoso" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var token = await _authService.LoginUserAsync(request.Email, request.Password);
            if (token == null) return Unauthorized("Email o contraseña incorrectos.");

            return Ok(new { token });
        }
    }
}