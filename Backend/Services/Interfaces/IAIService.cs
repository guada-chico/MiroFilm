using System.Collections.Generic;
using System.Threading.Tasks;

namespace Miro.Services.Interfaces
{
    public interface IAIService
    {
        /// <summary>
        /// Envía el mensaje y el historial al proveedor de IA y devuelve la respuesta en texto.
        /// </summary>
        Task<string> GetChatResponseAsync(string message, List<object> conversationHistory = null);
    }
}
