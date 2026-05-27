import api from './api-config';

/**
 * Obtiene todas las series disponibles de la base de datos.
 */
export const getAllSeries = async () => {
  const response = await api.get('/series');
  return response.data;
};

/**
 * Obtiene series populares de TMDB.
 */
export const getPopularSeries = async (page = 1) => {
  const response = await api.get('/series/tmdb/popular', { params: { page } });
  return response.data;
};

/**
 * Obtiene series mejor calificadas de TMDB.
 */
export const getTopRatedSeries = async (page = 1) => {
  const response = await api.get('/series/tmdb/top-rated', { params: { page } });
  return response.data;
};

/**
 * Busca series en TMDB.
 */
export const searchSeries = async (query) => {
  const response = await api.get('/series/tmdb/search', { params: { q: query } });
  return response.data;
};

/**
 * Obtiene detalles de una serie de TMDB.
 */
export const getSeriesDetails = async (tmdbId) => {
  const response = await api.get(`/series/tmdb/${tmdbId}`);
  return response.data;
};

/**
 * Obtiene series por género de TMDB.
 */
export const getSeriesByGenre = async (genreId, page = 1) => {
  console.log(`Llamando a getSeriesByGenre con genreId=${genreId}, page=${page}`);
  const response = await api.get('/series/tmdb/genre', { params: { genreId, page } });
  console.log('Respuesta de getSeriesByGenre:', response.data);
  return response.data;
};

/**
 * Obtiene una serie por ID.
 */
export const getSeriesById = async (id) => {
  const response = await api.get(`/series/${id}`);
  return response.data;
};

/**
 * Agrega una nueva serie.
 */
export const addSeries = async (series) => {
  const response = await api.post('/series', series);
  return response.data;
};

/**
 * Actualiza una serie existente.
 */
export const updateSeries = async (id, series) => {
  const response = await api.put(`/series/${id}`, series);
  return response.data;
};

/**
 * Elimina una serie.
 */
export const deleteSeries = async (id) => {
  const response = await api.delete(`/series/${id}`);
  return response.data;
};
