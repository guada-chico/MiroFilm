import api from './api-config';

/**
 * Obtiene las recomendaciones personalizadas del usuario actual.
 */
export const getMyRecommendations = async () => {
  // Agregar timestamp para evitar caché
  const response = await api.get('/recommendations', { params: { t: Date.now() } });
  return response.data;
};

/**
 * Obtiene películas populares de TMDB.
 */
export const getPopularMovies = async (page = 1) => {
  const response = await api.get('/movies/tmdb/popular', { params: { page } });
  return response.data;
};

/**
 * Obtiene películas mejor calificadas de TMDB.
 */
export const getTopRatedMovies = async (page = 1) => {
  const response = await api.get('/movies/tmdb/top-rated', { params: { page } });
  return response.data;
};

/**
 * Obtiene películas próximas a estrenarse de TMDB.
 */
export const getUpcomingMovies = async (page = 1) => {
  const response = await api.get('/movies/tmdb/upcoming', { params: { page } });
  return response.data;
};

/**
 * Obtiene películas en cines actualmente de TMDB.
 */
export const getNowPlayingMovies = async (page = 1) => {
  const response = await api.get('/movies/tmdb/now-playing', { params: { page } });
  return response.data;
};

/**
 * Busca películas en TMDB.
 */
export const searchMovies = async (query) => {
  const response = await api.get('/movies/tmdb/search', { params: { q: query } });
  return response.data;
};

/**
 * Obtiene detalles de una película de TMDB.
 */
export const getMovieDetails = async (tmdbId) => {
  const response = await api.get(`/movies/tmdb/${tmdbId}`);
  return response.data;
};

/**
 * Obtiene películas por género de TMDB.
 */
export const getMoviesByGenre = async (genreId, page = 1) => {
  console.log(`Llamando a getMoviesByGenre con genreId=${genreId}, page=${page}`);
  const response = await api.get('/movies/tmdb/genre', { params: { genreId, page } });
  console.log('Respuesta de getMoviesByGenre:', response.data);
  return response.data;
};
