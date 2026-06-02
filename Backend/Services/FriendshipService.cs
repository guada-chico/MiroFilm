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
    if (senderId == receiverId) return false;

    try
    {
        // 1. Buscamos CUALQUIER relación previa en ambos sentidos
        var existingFriendships = await _context.Friendships
            .Where(f => (f.UserRequestId == senderId && f.UserReceiveId == receiverId) ||
                        (f.UserRequestId == receiverId && f.UserReceiveId == senderId))
            .ToListAsync();

        // 2. Si existen, las eliminamos por completo del Contexto para limpiar la base de datos
        if (existingFriendships.Any())
        {
            _context.Friendships.RemoveRange(existingFriendships);
            await _context.SaveChangesAsync(); // Forzamos el borrado inmediato en la BD
        }

        // 3. Creamos la nueva solicitud limpia desde cero
        var newFriendship = new Friendship 
        { 
            UserRequestId = senderId,
            UserReceiveId = receiverId,
            Status = "Pending"
        };

        _context.Friendships.Add(newFriendship);
        
        // Guardamos la nueva solicitud
        var saveResult = await _context.SaveChangesAsync() > 0;

        // 4. Enviamos la notificación de manera totalmente aislada
        if (saveResult)
        {
            try
            {
                await _notifService.CreateNoteAsync(receiverId, "¡Tienes una nueva solicitud de amistad pendiente!");
            }
            catch (Exception notifEx)
            {
                Console.WriteLine($"[Notificación] No se pudo enviar la alerta: {notifEx.Message}");
            }
        }

        return saveResult;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error crítico en SendRequestAsync: {ex.Message}");
        return false;
    }
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
                try
                {
                    await _notifService.CreateNoteAsync(f.UserRequestId, "¡Tu solicitud de amistad ha sido aceptada!");
                }
                catch (Exception ex)
                {
                    // Log del error pero no falla el proceso de aceptación
                    Console.WriteLine($"Error al crear notificación: {ex.Message}");
                }
            }

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Friendship>> GetPendingRequestsAsync(int userId)
        {
            // Obtiene solicitudes pendientes recibidas por el usuario
            try
            {
                return await _context.Friendships
                    .Where(f => f.UserReceiveId == userId && f.Status == "Pending")
                    .Include(f => f.UserRequest)
                    .Include(f => f.UserReceive)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetPendingRequestsAsync: {ex.Message}");
                return new List<Friendship>();
            }
        }

        public async Task<IEnumerable<Friendship>> GetSentRequestsAsync(int userId)
        {
            // Obtiene solicitudes pendientes enviadas por el usuario
            try
            {
                return await _context.Friendships
                    .Where(f => f.UserRequestId == userId && f.Status == "Pending")
                    .Include(f => f.UserRequest)
                    .Include(f => f.UserReceive)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetSentRequestsAsync: {ex.Message}");
                return new List<Friendship>();
            }
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

        public async Task<bool> RemoveFriendAsync(int friendshipId, int userId)
        {
            try
            {
                var friendship = await _context.Friendships.FindAsync(friendshipId);

                // Validar que la amistad existe y que uno de los dos usuarios es el que hace la solicitud
                if (friendship == null || 
                    (friendship.UserRequestId != userId && friendship.UserReceiveId != userId))
                    return false;

                // Usar una consulta SQL directa para asegurar la eliminación
                var result = await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"DELETE FROM Friendships WHERE Id = {friendshipId}");

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error eliminando amigo: {ex.Message}");
                return false;
            }
        }
    }
}