using Miro.Models;

namespace Miro.Services.Interfaces
{
    public interface IFriendshipService
    {
        // 1. Enviar solicitud: debe recibir quién envía y quién recibe
        Task<bool> SendRequestAsync(int senderId, int receiverId);

        // 2. Ver amigos: devuelve la lista de relaciones aceptadas
        Task<IEnumerable<Friendship>> GetUserFriendsAsync(int userId);

        // 3. Responder: permite cambiar el estado a "Accepted" o "Rejected"
        Task<bool> RespondToRequestAsync(int friendshipId, string status);
    }
}