import axios from 'axios';

// URL del backend .NET
// Detectar automáticamente si estamos en desarrollo o producción
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5285/api';

const api = axios.create({
  baseURL: API_URL,
});

export const getValidToken = () => {
  return localStorage.getItem('token');
};

// Adjunta el token JWT en cada petición si existe
api.interceptors.request.use((config) => {
  const token = getValidToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token enviado:', token.substring(0, 20) + '...');
  } else {
    console.warn('No hay token disponible');
  }
  return config;
});

// Redirige al login si el backend devuelve 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;