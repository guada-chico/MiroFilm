using Miro.Models;

namespace Miro.Services.Interfaces
{
    public interface INotificationService
    {
        Task CreateNoteAsync(int userId, string message);
        Task<IEnumerable<Notification>> GetMyNotesAsync(int userId);
        Task<bool> MarkAsReadAsync(int notificationId);
    }
}