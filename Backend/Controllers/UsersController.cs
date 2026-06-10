using Miro.Models;
using Miro.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BCrypt.Net;

namespace Miro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public UsersController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // Obtener el ID del usuario autenticado desde el token JWT
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new UnauthorizedAccessException("Usuario no autenticado");
            }
            return userId;
        }

        /// <summary>
        /// Obtiene el perfil del usuario autenticado
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                int userId = GetUserId();
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                    return NotFound("Usuario no encontrado");

                return Ok(new
                {
                    id = user.Id,
                    name = user.Name,
                    email = user.Email,
                    avatarUrl = user.AvatarUrl
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized("No autenticado");
            }
        }

        /// <summary>
        /// Actualiza el perfil del usuario (nombre y email)
        /// </summary>
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            try
            {
                int userId = GetUserId();
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                    return NotFound("Usuario no encontrado");

                // Validar que el email no esté en uso por otro usuario
                if (request.Email != user.Email)
                {
                    var existingUser = await _context.Users
                        .FirstOrDefaultAsync(u => u.Email == request.Email);
                    if (existingUser != null)
                        return BadRequest("El email ya está en uso");
                }

                user.Name = request.Name;
                user.Email = request.Email;

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Perfil actualizado correctamente" });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized("No autenticado");
            }
        }

        /// <summary>
        /// Cambia la contraseña del usuario
        /// </summary>
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                int userId = GetUserId();
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                    return NotFound("Usuario no encontrado");

                // Verificar contraseña actual
                if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                    return BadRequest("Contraseña actual incorrecta");

                // Validar nueva contraseña
                if (request.NewPassword.Length < 8)
                    return BadRequest("La contraseña debe tener mínimo 8 caracteres");

                if (!System.Text.RegularExpressions.Regex.IsMatch(request.NewPassword, @"[A-Z]"))
                    return BadRequest("La contraseña debe contener al menos una mayúscula");

                if (!System.Text.RegularExpressions.Regex.IsMatch(request.NewPassword, @"[!@#$%&*.,]"))
                    return BadRequest("La contraseña debe contener un carácter especial (!@#$%&*.,)");

                // Actualizar contraseña
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Contraseña actualizada correctamente" });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized("No autenticado");
            }
        }

        /// <summary>
        /// Actualiza el avatar del usuario
        /// </summary>
        [HttpPost("avatar")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateAvatar()
        {
            try
            {
                int userId = GetUserId();
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                    return NotFound("Usuario no encontrado");

                var file = Request.Form?.Files?.FirstOrDefault();
                if (file == null || file.Length == 0)
                    return BadRequest("No se proporcionó archivo");

                // Validar tipo de archivo
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var fileExtension = Path.GetExtension(file.FileName).ToLower();
                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest("Tipo de archivo no permitido. Solo se aceptan imágenes (jpg, png, gif)");

                // Crear directorio si no existe
                var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "avatars");
                Directory.CreateDirectory(uploadsDir);

                // Generar nombre único para el archivo
                var fileName = $"{userId}_{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsDir, fileName);

                // Guardar archivo
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Actualizar URL del avatar en la base de datos
                user.AvatarUrl = $"/uploads/avatars/{fileName}";
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Avatar actualizado", avatarUrl = user.AvatarUrl });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized("No autenticado");
            }
        }

        /// <summary>
        /// Elimina el avatar del usuario
        /// </summary>
        [HttpDelete("avatar")]
        public async Task<IActionResult> DeleteAvatar()
        {
            try
            {
                int userId = GetUserId();
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                    return NotFound("Usuario no encontrado");

                // Eliminar archivo si existe
                if (!string.IsNullOrEmpty(user.AvatarUrl))
                {
                    var filePath = Path.Combine(_env.WebRootPath, user.AvatarUrl.TrimStart('/'));
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }

                // Actualizar base de datos
                user.AvatarUrl = null;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Avatar eliminado" });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized("No autenticado");
            }
        }

        /// <summary>
        /// Elimina la cuenta del usuario autenticado y datos relacionados
        /// </summary>
        [HttpDelete("me")]
public async Task<IActionResult> DeleteAccount()
{
    try
    {
        int userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            return NotFound("Usuario no encontrado");

        // FASE 1: Limpiar los archivos físicos (Avatar)
        if (!string.IsNullOrEmpty(user.AvatarUrl))
        {
            var filePath = Path.Combine(_env.WebRootPath, user.AvatarUrl.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
        }

        // FASE 2: Borrar primero las entidades dependientes (Evita bloqueos de FK)
        var favs = await _context.Favorites.Where(f => f.UserId == userId).ToListAsync();
        if (favs.Any()) _context.Favorites.RemoveRange(favs);

        var watching = await _context.WatchingStatuses.Where(w => w.UserId == userId).ToListAsync();
        if (watching.Any()) _context.WatchingStatuses.RemoveRange(watching);

        var reading = await _context.ReadingStatuses.Where(r => r.UserId == userId).ToListAsync();
        if (reading.Any()) _context.ReadingStatuses.RemoveRange(reading);

        var notes = await _context.Notifications.Where(n => n.UserId == userId).ToListAsync();
        if (notes.Any()) _context.Notifications.RemoveRange(notes);

        // Limpiar amistades cruzadas (donde sea remitente o destinatario)
        var friendships = await _context.Friendships.Where(f => f.UserId == userId || f.FriendId == userId).ToListAsync();
        if (friendships.Any()) _context.Friendships.RemoveRange(friendships);

        // Guardamos los cambios de la Fase 2 para dejar al usuario "libre" de relaciones
        await _context.SaveChangesAsync();

        // FASE 3: Ahora que el usuario no tiene ninguna dependencia, lo borramos de forma segura
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Cuenta eliminada" });
    }
    catch (UnauthorizedAccessException)
    {
        return Unauthorized("No autenticado");
    }
    catch (Exception ex)
    {
        // Esto te pintará en la consola de la terminal del backend el error exacto de SQL por si persistiera
        Console.WriteLine($"[ERROR CRÍTICO BORRADO]: {ex.Message}");
        if (ex.InnerException != null) Console.WriteLine($"[INNER EXCEPTION]: {ex.InnerException.Message}");
        
        return StatusCode(500, $"Error interno al eliminar la cuenta: {ex.Message}");
    }
}

    // DTOs para las solicitudes
    public class UpdateProfileRequest
    {
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = "";
        public string NewPassword { get; set; } = "";
    }
}
