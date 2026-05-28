import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Mail, Lock, User } from 'lucide-react';
import { login, register } from '../../services/auth-service'; 
import './Login.css';
import logoMiroFilm from '../../assets/logo-mirofilm-sf.png';

export default function Login({ setToken }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    setConfirmPassword('');
  }, [isRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isRegister) {
        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
          Swal.fire({
            title: 'Error',
            text: 'Las contraseñas no coinciden',
            icon: 'error',
            confirmButtonText: 'Reintentar'
          });
          return;
        }

        // Llamar al servicio de registro
        await register(name, email, password);
        
        Swal.fire({
          title: '¡Registro exitoso!',
          text: 'Ahora puedes iniciar sesión',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        
        // Cambiar a modo login
        setIsRegister(false);
        setName('');
        setPassword('');
        setConfirmPassword('');
      } else {
        // Llamar al servicio de login
        await login(email, password);
        
        Swal.fire({
          title: '¡Bienvenido!',
          text: 'Acceso concedido',
          icon: 'success',
          confirmButtonText: 'Entrar',
          timer: 1500
        }).then(() => {
          navigate('/inicio');
        });
      }
    } catch (error) {
      // Extraer el mensaje de error más descriptivo posible
      let mensaje = 'Ha ocurrido un error inesperado.';

      if (!error.response) {
        // Sin respuesta = backend caído o certificado SSL no aceptado
        mensaje = 'No se puede conectar con el servidor.\n\n' +
          '1. Comprueba que el backend está corriendo.\n' +
          '2. Abre https://localhost:7072/swagger en el navegador y acepta el certificado SSL.';
      } else if (error.response.status === 400) {
        // Errores de validación del backend (contraseña débil, usuario ya existe, etc.)
        const data = error.response.data;
        if (typeof data === 'string') {
          mensaje = data;
        } else if (data?.errors) {
          // ModelState errors de ASP.NET
          mensaje = Object.values(data.errors).flat().join('\n');
        } else if (data?.message) {
          mensaje = data.message;
        } else {
          mensaje = 'Datos inválidos. La contraseña debe tener mínimo 8 caracteres, una mayúscula y un carácter especial (!@#$%...).';
        }
      } else if (error.response.status === 401) {
        mensaje = 'Email o contraseña incorrectos.';
      } else {
        mensaje = error.response?.data || error.message || mensaje;
      }

      Swal.fire({
        title: 'Error',
        text: mensaje,
        icon: 'error',
        confirmButtonText: 'Reintentar'
      });
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img src={logoMiroFilm} alt="MiroFilm Logo" className="logo-img" />
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          
          {isRegister && (
            <div className="input-box">
              <User className="icon" size={20} />
              <input
                type="text"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-box">
            <Mail className="icon" size={20} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-box">
            <Lock className="icon" size={20} />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Requisitos de contraseña visibles solo en registro */}
          {isRegister && (
            <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '-0.5rem', marginBottom: '0.25rem', lineHeight: '1.4' }}>
              Mínimo 8 caracteres, una mayúscula y un carácter especial (!@#$%&*.,)
            </p>
          )}

          {isRegister && (
            <div className="input-box">
              <Lock className="icon" size={20} />
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="main-btn">
            {isRegister ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <div className="login-switch">
          <button type="button" onClick={() => setIsRegister(!isRegister)}>
            {isRegister
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}