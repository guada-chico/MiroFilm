using Miro.Data;
using Miro.Models;
using Miro.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Miro.Services
{
    public class FriendshipService : IFriendshipService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notifService;

        public FriendshipService(AppDbContext context, INotificationService notifService)
        {
            _context = context;
            _notifService = notifService;
        }

        public async Task<bool> SendRequestAsync(int senderId, int receiverId)
        {
            // 1. Validación: No puedes ser tu propio amigo
            if (senderId == receiverId) return false;

            // 2. Comprobar si ya existe una relación previa (en cualquier estado)
            var existing = await _context.Friendships.AnyAsync(f =>
                (f.UserRequestId == senderId && f.UserReceiveId == receiverId) ||
                (f.UserRequestId == receiverId && f.UserReceiveId == senderId));

            if (existing) return false;

            // 3. Crear la nueva solicitud con estado "Pending"
            var friendship = new Friendship
            {
                UserRequestId = senderId,
                UserReceiveId = receiverId,
                Status = "Pending" // Forzamos el estado inicial
            };

            _context.Friendships.Add(friendship);

            // 4. Crear la notificación para el receptor
            // Usamos el servicio de notificaciones inyectado
            await _notifService.CreateNoteAsync(receiverId, "¡Tienes una nueva solicitud de amistad pendiente!");

            // 5. Guardar todos los cambios (la amistad y la notificación) en una sola transacción
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Friendship>> GetUserFriendsAsync(int userId)
        {
            // Retorna solo las relaciones que han sido aceptadas
            return await _context.Friendships
                .Where(f => (f.UserRequestId == userId || f.UserReceiveId == userId) && f.Status == "Accepted")
                .Include(f => f.UserRequest) // Opcional: para traer datos del usuario
                .Include(f => f.UserReceive)
                .ToListAsync();
        }

        public async Task<bool> RespondToRequestAsync(int friendshipId, string status)
        {
            // status debe ser "Accepted" o "Rejected"
            var f = await _context.Friendships.FindAsync(friendshipId);

            if (f == null) return false;

            f.Status = status;

            // Si se acepta, podrías enviar una notificación de vuelta al que envió la solicitud
            if (status == "Accepted")
            {
                await _notifService.CreateNoteAsync(f.UserRequestId, "¡Tu solicitud de amistad ha sido aceptada!");
            }

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Friendship>> GetPendingRequestsAsync(int userId)
        {
            // Obtiene solicitudes pendientes recibidas por el usuario
            return await _context.Friendships
                .Where(f => f.UserReceiveId == userId && f.Status == "Pending")
                .Include(f => f.UserRequest)
                .Include(f => f.UserReceive)
                .ToListAsync();
        }

        public async Task<IEnumerable<Friendship>> GetSentRequestsAsync(int userId)
        {
            // Obtiene solicitudes pendientes enviadas por el usuario
            return await _context.Friendships
                .Where(f => f.UserRequestId == userId && f.Status == "Pending")
                .Include(f => f.UserRequest)
                .Include(f => f.UserReceive)
                .ToListAsync();
        }

        public async Task<IEnumerable<User>> SearchUsersAsync(string query)
        {
            // Busca usuarios por nombre o email (case-insensitive)
            if (string.IsNullOrWhiteSpace(query))
                return new List<User>();

            var lowerQuery = query.ToLower().Trim();
            
            var results = await _context.Users
                .Where(u => EF.Functions.Like(u.Name, $"%{query}%") || 
                           EF.Functions.Like(u.Email, $"%{query}%"))
                .ToListAsync();
            
            return results;
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        public async Task<bool> CancelRequestAsync(int friendshipId, int userId)
        {
            var friendship = await _context.Friendships.FindAsync(friendshipId);

            if (friendship == null || friendship.UserRequestId != userId || friendship.Status != "Pending")
                return false;

            _context.Friendships.Remove(friendship);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<Friendship?> GetFriendshipStatusAsync(int userId1, int userId2)
        {
            return await _context.Friendships
                .FirstOrDefaultAsync(f =>
                    (f.UserRequestId == userId1 && f.UserReceiveId == userId2) ||
                    (f.UserRequestId == userId2 && f.UserReceiveId == userId1));
        }
    }
}