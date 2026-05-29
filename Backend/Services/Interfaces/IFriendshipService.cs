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

        // 4. Obtener solicitudes pendientes recibidas
        Task<IEnumerable<Friendship>> GetPendingRequestsAsync(int userId);

        // 5. Obtener solicitudes pendientes enviadas
        Task<IEnumerable<Friendship>> GetSentRequestsAsync(int userId);

        // 6. Buscar usuarios por nombre o email
        Task<IEnumerable<User>> SearchUsersAsync(string query);

        // 7. Obtener información de un usuario específico
        Task<User?> GetUserByIdAsync(int userId);

        // 8. Cancelar una solicitud enviada
        Task<bool> CancelRequestAsync(int friendshipId, int userId);

        // 9. Obtener estado de amistad entre dos usuarios
        Task<Friendship?> GetFriendshipStatusAsync(int userId1, int userId2);
    }
}