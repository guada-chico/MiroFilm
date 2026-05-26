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
 * Cierra sesión eliminando el token.
 */
export const logout = () => {
  localStorage.removeItem('token');
};

/**
 * Devuelve true si hay un token guardado.
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
