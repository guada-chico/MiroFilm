import api from './api-config';

/**
 * Inicia sesión y guarda el token en localStorage.
 * @returns {string} El token JWT
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { token } = response.data;
  localStorage.setItem('token', token);
  return token;
};

/**
 * Registra un nuevo usuario.
 */
export const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

/**
 * Cierra sesión eliminando el token y limpiando datos.
 */
export const logout = () => {
  localStorage.removeItem('token');
  // Limpiar otros datos de sesión si es necesario
  localStorage.removeItem('user');
};

/**
 * Devuelve true si hay un token guardado.
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

