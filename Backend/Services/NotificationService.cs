using Miro.Data;
using Miro.Models;
using Miro.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Miro.Services
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;
        public NotificationService(AppDbContext context) => _context = context;

        public async Task<IEnumerable<Notification>> GetMyNotesAsync(int userId) =>
            await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

        public async Task CreateNoteAsync(int userId, string message)
        {
            _context.Notifications.Add(new Notification { UserId = userId, Message = message });
            await _context.SaveChangesAsync();
        }

        public async Task<bool> MarkAsReadAsync(int notificationId)
        {
            var note = await _context.Notifications.FindAsync(notificationId);
            if (note == null) return false;
            note.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}