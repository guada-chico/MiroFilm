using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly ILogger<ChatController> _logger;

        public ChatController(ILogger<ChatController> logger)
        {
            _logger = logger;
        }

        [HttpPost]
        [AllowAnonymous]
        public IActionResult SendMessage([FromBody] ChatMessage request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.Message))
                    return BadRequest(new { error = "El mensaje no puede estar vacío" });

                var response = GenerateResponse(request.Message);
                return Ok(new { response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en chat");
                return StatusCode(500, new { error = "Error al procesar el mensaje" });
            }
        }

        private string GenerateResponse(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return "Por favor, escribe un mensaje.";

            var msg = input.ToLower().Trim();
            msg = msg.Replace("á", "a").Replace("é", "e").Replace("í", "i")
                     .Replace("ó", "o").Replace("ú", "u").Replace("ü", "u");

            // ── Saludos ────────────────────────────────────────────────
            if (Contiene(msg, "hola", "hey", "buenas", "buenos dias", "buenas tardes",
                               "buenas noches", "que tal", "como estas", "saludos"))
                return "¡Hola! Soy el asistente de MiroFilm 🎬 Estoy aquí para ayudarte con cualquier duda sobre la app. Puedes preguntarme sobre películas, series, favoritos, amigos, recomendaciones o tu perfil.";

            // ── Favoritos ──────────────────────────────────────────────
            if (Contiene(msg, "favorito", "favorita", "favoritos", "favoritas", "corazon", "like", "guardar"))
            {
                if (Contiene(msg, "eliminar", "quitar", "borrar", "sacar", "remover"))
                    return "Para eliminar una película o serie de tus favoritos, ve a la sección correspondiente, localiza el contenido y vuelve a hacer clic en el icono de corazón ❤️. También puedes hacerlo desde la sección 'Favoritos' del menú lateral.";

                if (Contiene(msg, "ver", "listar", "donde", "encontrar", "mis"))
                    return "Puedes ver todos tus favoritos en la sección 'Favoritos' del menú lateral izquierdo. Ahí encontrarás tanto las películas como las series que hayas marcado con el corazón ❤️.";

                return "Para añadir una película o serie a favoritos, haz clic en el icono de corazón ❤️ que aparece en la tarjeta del contenido. También puedes hacerlo desde la página de detalles. Para ver todos tus favoritos, accede a la sección 'Favoritos' del menú lateral.";
            }

            // ── Estado de visualización ────────────────────────────────
            if (Contiene(msg, "marcar", "estado", "visto", "vista", "viendo", "completada",
                               "completado", "abandonada", "abandonado", "pendiente", "progreso"))
            {
                if (Contiene(msg, "pelicula", "film", "cine"))
                    return "Para cambiar el estado de una película, ve a la sección 'Películas', haz clic en la tarjeta y selecciona el estado: Pendiente, Viendo o Completada. El cambio se guarda automáticamente.";

                if (Contiene(msg, "serie"))
                    return "Para cambiar el estado de una serie, ve a la sección 'Series', haz clic en la tarjeta y elige entre: Pendiente, Viendo, Completada o Abandonada. El progreso se guarda automáticamente.";

                return "Puedes marcar el estado de cualquier película o serie desde su tarjeta. Los estados disponibles son: Pendiente, Viendo, Completada y Abandonada. Todo se guarda automáticamente en tu cuenta.";
            }

            // ── Películas ──────────────────────────────────────────────
            if (Contiene(msg, "pelicula", "peliculas", "film", "cine", "movie"))
            {
                if (Contiene(msg, "buscar", "encontrar", "busco", "donde"))
                    return "Puedes buscar películas usando el buscador en la parte superior de la sección 'Películas'. También puedes filtrar por género o explorar las más populares y mejor valoradas.";

                if (Contiene(msg, "detalle", "informacion", "sinopsis", "info"))
                    return "Para ver los detalles de una película (sinopsis, género, duración, valoración), haz clic sobre su tarjeta. Se abrirá la página de detalles con toda la información disponible.";

                return "En la sección 'Películas' puedes explorar el catálogo completo, buscar por título, ver detalles, añadir a favoritos y gestionar tu estado de visualización.";
            }

            // ── Series ─────────────────────────────────────────────────
            if (Contiene(msg, "serie", "series", "temporada", "episodio", "capitulo"))
            {
                if (Contiene(msg, "buscar", "encontrar", "busco", "donde"))
                    return "Puedes buscar series en la sección 'Series' usando el buscador superior. También puedes explorar por géneros o ver las más populares del momento.";

                if (Contiene(msg, "temporada", "episodio", "capitulo"))
                    return "En la página de detalles de una serie puedes ver información sobre sus temporadas y episodios, así como actualizar tu progreso de visualización.";

                return "En la sección 'Series' puedes explorar el catálogo, buscar por título, ver detalles de temporadas, añadir a favoritos y marcar tu progreso de visualización.";
            }

            // ── Recomendaciones ────────────────────────────────────────
            if (Contiene(msg, "recomendacion", "recomendaciones", "sugerencia", "sugerencias",
                               "que ver", "que pelicula", "que serie"))
                return "El sistema de recomendaciones de MiroFilm analiza tu historial de películas y series vistas, tus géneros favoritos y tus valoraciones para sugerirte contenido que se adapte a tus gustos. Cuanto más uses la app, mejores serán las recomendaciones 🎯";

            // ── Amigos ─────────────────────────────────────────────────
            if (Contiene(msg, "amigo", "amigos", "amistad", "seguir", "compartir", "social"))
            {
                if (Contiene(msg, "añadir", "agregar", "enviar", "solicitud"))
                    return "Para añadir un amigo, ve a la sección 'Amigos' del menú lateral y busca al usuario por su nombre. Envíale una solicitud de amistad y cuando la acepte podréis ver vuestra actividad mutuamente.";

                if (Contiene(msg, "eliminar", "borrar", "quitar"))
                    return "Para eliminar un amigo, ve a la sección 'Amigos', localiza al usuario en tu lista y selecciona la opción de eliminar amistad.";

                if (Contiene(msg, "notificacion", "solicitud", "peticion"))
                    return "Recibirás una notificación cuando alguien te envíe una solicitud de amistad. Puedes aceptarla o rechazarla desde la sección de notificaciones o desde 'Amigos'.";

                return "En la sección 'Amigos' puedes buscar otros usuarios, enviar solicitudes de amistad y ver su actividad reciente. Tus películas y series favoritas también aparecen en tu perfil para que tus amigos las vean.";
            }

            // ── Perfil ─────────────────────────────────────────────────
            if (Contiene(msg, "perfil", "cuenta", "usuario", "datos", "avatar", "foto", "imagen"))
            {
                if (Contiene(msg, "cambiar", "editar", "modificar", "actualizar", "foto", "avatar", "imagen"))
                    return "Puedes cambiar tu foto de perfil desde la sección 'Perfil'. Haz clic en tu avatar actual y selecciona una nueva imagen desde tu dispositivo.";

                if (Contiene(msg, "contraseña", "password"))
                    return "Para cambiar tu contraseña, ve a la sección 'Ajustes' y busca la opción de seguridad. Necesitarás introducir tu contraseña actual para confirmar el cambio.";

                return "En tu perfil puedes ver tu actividad reciente, tus películas y series favoritas, y tus amigos. Para editar tus datos personales o foto de perfil, accede a la sección 'Perfil' desde el menú lateral.";
            }

            // ── Ajustes ────────────────────────────────────────────────
            if (Contiene(msg, "ajuste", "ajustes", "configuracion", "idioma", "tema", "oscuro", "claro"))
            {
                if (Contiene(msg, "idioma", "language", "ingles", "español"))
                    return "Puedes cambiar el idioma de la app desde 'Ajustes'. Actualmente MiroFilm está disponible en español e inglés.";

                if (Contiene(msg, "tema", "oscuro", "claro", "dark", "light"))
                    return "Puedes cambiar entre el tema claro y oscuro desde la sección 'Ajustes'. El cambio se aplica de forma inmediata.";

                return "En la sección 'Ajustes' puedes personalizar tu experiencia: cambiar el idioma, el tema visual (claro/oscuro) y otras preferencias de la app.";
            }

            // ── Inicio / actividad ─────────────────────────────────────
            if (Contiene(msg, "inicio", "home", "principal", "actividad", "resumen", "dashboard"))
                return "La página de Inicio es tu panel principal. Aquí puedes ver un resumen de tu actividad reciente, acceder rápidamente a tus listas de películas y series, y ver las novedades de tus amigos.";

            // ── Listas ─────────────────────────────────────────────────
            if (Contiene(msg, "lista", "listas", "mis listas", "coleccion"))
                return "En 'Mis Listas' puedes organizar tu contenido por estado: películas y series que estás viendo, completadas, pendientes o abandonadas. Es tu biblioteca personal de MiroFilm 📚";

            // ── Dónde ver contenido ────────────────────────────────────
            if (Contiene(msg, "donde ver", "donde puedo ver", "plataforma", "streaming",
                               "netflix", "hbo", "disney", "prime", "movistar", "filmin"))
                return "MiroFilm te ayuda a gestionar y descubrir películas y series, pero no indica en qué plataforma está disponible cada contenido. Para saber dónde ver una película o serie te recomiendo consultar JustWatch (justwatch.com), que te muestra en qué servicios de streaming está disponible en España 🎬";

            // ── Ayuda general ──────────────────────────────────────────
            if (Contiene(msg, "ayuda", "help", "como", "como se", "puedo", "explicar", "explicame"))
                return "Claro, estoy aquí para ayudarte 😊 Puedes preguntarme sobre:\n• Añadir películas o series a favoritos\n• Cambiar el estado de visualización\n• Cómo funcionan las recomendaciones\n• Gestionar amigos y notificaciones\n• Configurar tu perfil y ajustes\n\n¿Sobre qué quieres saber más?";

            // ── Agradecimientos ────────────────────────────────────────
            if (Contiene(msg, "gracias", "thanks", "genial", "perfecto", "ok", "vale", "entendido"))
                return "¡De nada! Si tienes cualquier otra duda, no dudes en preguntarme 😊";

            // ── Despedidas ─────────────────────────────────────────────
            if (Contiene(msg, "adios", "hasta luego", "bye", "chao", "nos vemos"))
                return "¡Hasta luego! Que disfrutes de tus películas y series 🎬🍿";

            // ── Respuesta por defecto ──────────────────────────────────
            return "No estoy seguro de entender tu pregunta. Puedo ayudarte con:\n• Películas y series (buscar, favoritos, estados)\n• Recomendaciones\n• Amigos y notificaciones\n• Perfil y ajustes\n\n¿Podrías reformular tu pregunta?";
        }

        private bool Contiene(string mensaje, params string[] palabras)
        {
            return palabras.Any(p => mensaje.Contains(p));
        }
    }

    public class ChatMessage
    {
        public string Message { get; set; }
        public List<object> ConversationHistory { get; set; } = new List<object>();
    }
}