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

// Redirige al login si el backend devuelve 401 (solo para endpoints que requieren autenticación)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir a login si es un 401 en un endpoint que requiere autenticación
    // Los endpoints públicos devuelven 200 incluso sin token
    if (error.response?.status === 401) {
      // Verificar si el error es de un endpoint que requiere autenticación
      const url = error.config?.url || '';
      const publicEndpoints = ['/recommendations', '/recommendations/series', '/movies/tmdb', '/series/tmdb'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint));
      
      // Solo redirigir si NO es un endpoint público
      if (!isPublicEndpoint) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;