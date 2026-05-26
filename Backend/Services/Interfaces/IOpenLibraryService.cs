using Miro.Models;

namespace Miro.Services.Interfaces
{
    public interface IOpenLibraryService
    {
        // Para buscar detalles extra de un libro por su ISBN
        Task<string?> GetHighResCoverUrlAsync(string isbn);
    }
}