using Miro.Models;

namespace Miro.Services.Interfaces
{
    public interface IAuthService
    {
        Task<User?> RegisterUserAsync(User user, string password);
        Task<string?> LoginUserAsync(string email, string password);
    }
}