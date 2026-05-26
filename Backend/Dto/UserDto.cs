using System.ComponentModel.DataAnnotations;

namespace Miro.Dto
{
    public class UserDto
    {
        [Required(ErrorMessage = "El nombre de usuario es obligatorio.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es obligatorio.")]
        [EmailAddress(ErrorMessage = "Formato de email inválido.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es obligatoria.")]
        [RegularExpression(@"^(?=.*[A-Z])(?=.*[.,!@#$%^&*])(?=.{8,}).*$",
         ErrorMessage = "La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial.")]
        public string Password { get; set; } = string.Empty;
    }
}