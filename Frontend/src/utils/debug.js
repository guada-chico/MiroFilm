/**
 * Utilidades de depuración para verificar la conexión con el backend
 */

export const testBackendConnection = async () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5285/api';
  
  console.log('=== PRUEBA DE CONEXIÓN CON BACKEND ===');
  console.log('URL de API:', API_URL);
  
  try {
    // Prueba 1: Conexión básica
    console.log('\n1. Probando conexión básica...');
    const response = await fetch(`${API_URL}/movies/tmdb/popular?page=1`);
    console.log('Status:', response.status);
    console.log('OK:', response.ok);
    
    if (!response.ok) {
      console.error('Error:', response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('Datos recibidos:', data);
    console.log('Tipo de datos:', typeof data);
    console.log('Es array:', Array.isArray(data));
    console.log('Cantidad de películas:', Array.isArray(data) ? data.length : 'N/A');
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('Primera película:', data[0]);
    }
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
};

export const testSeriesConnection = async () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5285/api';
  
  console.log('=== PRUEBA DE CONEXIÓN SERIES ===');
  
  try {
    const response = await fetch(`${API_URL}/series/tmdb/popular?page=1`);
    console.log('Status:', response.status);
    
    if (!response.ok) {
      console.error('Error:', response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('Series recibidas:', data);
    console.log('Cantidad:', Array.isArray(data) ? data.length : 'N/A');
  } catch (error) {
    console.error('Error:', error);
  }
};
