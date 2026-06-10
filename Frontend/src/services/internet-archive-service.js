import api from './api-config';

/**
 * Busca películas y series en Internet Archive.
 * @param {string} query - Término de búsqueda
 * @param {number} rows - Número de resultados (default: 20)
 * @returns {Promise<Array>} Lista de películas/series encontradas
 */
export const searchInternetArchive = async (query, rows = 20) => {
  const response = await api.get('/internetarchive/search', { 
    params: { q: query, rows } 
  });
  return response.data;
};

/**
 * Obtiene películas clásicas populares de Internet Archive.
 * @param {number} rows - Número de resultados (default: 20)
 * @returns {Promise<Array>} Lista de películas clásicas
 */
export const getClassicMovies = async (rows = 20) => {
  const response = await api.get('/internetarchive/classics', { 
    params: { rows } 
  });
  return response.data;
};

/**
 * Obtiene series de TV gratuitas de Internet Archive.
 * @param {number} rows - Número de resultados (default: 20)
 * @returns {Promise<Array>} Lista de series de TV
 */
export const getFreeSeries = async (rows = 20) => {
  const response = await api.get('/internetarchive/series', { 
    params: { rows } 
  });
  return response.data;
};
