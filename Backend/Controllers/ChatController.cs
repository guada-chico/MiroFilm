using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Miro.Services.Interfaces;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly ILogger<ChatController> _logger;
        private readonly IAIService _aiService;

        public ChatController(ILogger<ChatController> logger, IAIService aiService)
        {
            _logger = logger;
            _aiService = aiService;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessage request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { error = "El mensaje no puede estar vacío" });
            }

            try
            {
                var response = await _aiService.GetChatResponseAsync(request.Message, request.ConversationHistory);
                return Ok(new { response, usedFallback = false });
            }
            catch (Exception ex)
            {
                // Registrar el error y devolver una respuesta por defecto amigable para el usuario
                _logger.LogError(ex, "Error al obtener respuesta de IA, aplicando fallback local");
                var fallback = GenerateLocalResponse(request.Message);
                return Ok(new { response = fallback, usedFallback = true });
            }
        }

        private string GenerateLocalResponse(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return "Por favor, escribe un mensaje.";

            message = message.ToLower().Trim();

            if ((message.Contains("película") || message.Contains("pelicula")) && (message.Contains("favorito") || message.Contains("favorita")))
                return "Para añadir una película a tus favoritos, haz clic en el icono de corazón en la tarjeta de la película. También puedes hacerlo desde la página de detalles.";

            if ((message.Contains("serie") || message.Contains("series")) && (message.Contains("vista") || message.Contains("visto") || message.Contains("estado") || message.Contains("marcar")))
                return "Para marcar una serie como vista, ve a la sección de 'Series', haz clic en la serie y selecciona su estado (Viendo, Completada, Abandonada, etc.).";

            if (message.Contains("recomendacion") || message.Contains("recomendaciones"))
                return "Nuestro sistema analiza tus películas y series vistas para sugerirte contenido nuevo que te pueda gustar.";

            if (message.Contains("inicio") || message.Contains("actividad") || message.Contains("estado") || message.Contains("resumen"))
                return "En la página de Inicio puedes ver tu actividad reciente y acceder a tus listas de películas y series.";

            if (message.Contains("amigo") || message.Contains("amigos") || message.Contains("compartir") || message.Contains("amistad"))
                return "Puedes añadir amigos desde la sección 'Amigos' y ver su actividad. Tus películas favoritas aparecerán en tu perfil.";

            if (message.Contains("ayuda") || message.Contains("help") || message.Contains("como") || message.Contains("cómo"))
                return "Puedo ayudarte con: cómo añadir películas a favoritos, cómo marcar series como vistas, cómo funcionan las recomendaciones, y más.";

            if (message.Contains("hola") || message.Contains("hey") || message.Contains("buenos") || message.Contains("qué tal"))
                return "¡Hola! Soy tu asistente de MiroFilm. Pregúntame sobre películas, series o cómo usar la app.";

            if (message.Contains("película"))
                return "¿Qué quieres saber sobre las películas? Puedo ayudarte con favoritos, recomendaciones, o cómo ver tu historial.";

            if (message.Contains("serie"))
                return "¿Qué quieres saber sobre las series? Puedo ayudarte a marcar series como vistas, ver recomendaciones, etc.";

            if (message.Contains("favorito"))
                return "Los favoritos te permiten guardar películas y series que te gustan. Haz clic en el icono de corazón para añadir.";

            if (message.Contains("buscar") || message.Contains("filtrar"))
                return "Puedes buscar películas y series en las secciones respectivas usando el buscador.";

            if (message.Contains("perfil") || message.Contains("cuenta") || message.Contains("usuario"))
                return "En tu perfil puedes ver tus películas favoritas, tu actividad y tus amigos.";

            return "Soy tu asistente de MiroFilm. Pregúntame sobre películas, series, favoritos, amigos, recomendaciones, o cómo usar la app.";
        }
    }

    public class ChatMessage
    {
        public string Message { get; set; }
        public List<object> ConversationHistory { get; set; } = new List<object>();
    }
}
