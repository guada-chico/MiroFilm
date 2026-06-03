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

            _context.ChangeTracker.Clear();

            try
            {
                var senderUser = await _context.Users.FindAsync(senderId);
                var senderName = senderUser?.Name ?? "Un usuario";

                var existingFriendships = await _context.Friendships
                    .Where(f => (f.UserRequestId == senderId && f.UserReceiveId == receiverId) ||
                                (f.UserRequestId == receiverId && f.UserReceiveId == senderId))
                    .ToListAsync();

                if (existingFriendships.Any())
                {
                    _context.Friendships.RemoveRange(existingFriendships);
                    await _context.SaveChangesAsync();
                    _context.ChangeTracker.Clear();
                }

                var newFriendship = new Friendship 
                { 
                    UserRequestId = senderId,
                    UserReceiveId = receiverId,
                    Status = "Pending"
                };

                _context.Friendships.Add(newFriendship);
                
                var saveResult = await _context.SaveChangesAsync() > 0;

                if (saveResult)
                {
                    try
                    {
                        await _notifService.CreateNoteAsync(receiverId, $"{senderName} te ha enviado una solicitud de amistad.");
                    }
                    catch (Exception)
                    {
                        // Silenciar errores de notificación para no bloquear la solicitud
                    }
                }

                return saveResult;
            }
            catch
            {
                return false;
            }
        }

        public async Task<IEnumerable<Friendship>> GetUserFriendsAsync(int userId)
        {
            return await _context.Friendships
                .Where(f => (f.UserRequestId == userId || f.UserReceiveId == userId) && f.Status == "Accepted")
                .Include(f => f.UserRequest)
                .Include(f => f.UserReceive)
                .ToListAsync();
        }

        public async Task<bool> RespondToRequestAsync(int friendshipId, string status)
        {
            try
            {
                var f = await _context.Friendships.FindAsync(friendshipId);

                if (f == null) return false;

                if (f.Status == status) return true;

                f.Status = status;

                await _context.SaveChangesAsync();

                if (status == "Accepted")
                {
                    try
                    {
                        var acceptingUser = await _context.Users.FindAsync(f.UserReceiveId);
                        var acceptingUserName = acceptingUser?.Name ?? "Un usuario";

                        await _notifService.CreateNoteAsync(f.UserRequestId, $"{acceptingUserName} ha aceptado tu solicitud de amistad.");
                    }
                    catch
                    {
                        // Silenciar errores de notificación
                    }
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<IEnumerable<Friendship>> GetPendingRequestsAsync(int userId)
        {
            return await _context.Friendships
                .Where(f => f.UserReceiveId == userId && f.Status == "Pending")
                .Include(f => f.UserRequest)
                .Include(f => f.UserReceive)
                .ToListAsync();
        }

        public async Task<IEnumerable<Friendship>> GetSentRequestsAsync(int userId)
        {
            return await _context.Friendships
                .Where(f => f.UserRequestId == userId && f.Status == "Pending")
                .Include(f => f.UserRequest)
                .Include(f => f.UserReceive)
                .ToListAsync();
        }

        public async Task<IEnumerable<User>> SearchUsersAsync(string query)
        {
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
            var friendship = await _context.Friendships.FindAsync(friendshipId);

            if (friendship == null || 
                (friendship.UserRequestId != userId && friendship.UserReceiveId != userId))
                return false;

            var result = await _context.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM Friendships WHERE Id = {friendshipId}");

            return result > 0;
        }
    }
}