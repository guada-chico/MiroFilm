import api from './api-config';

/**
 * Obtiene todos los favoritos del usuario actual.
 */
export const getMyFavorites = async () => {
  const response = await api.get('/movie-favorites');
  return response.data;
};

/**
 * Agrega o elimina una película de favoritos.
 */
export const toggleMovieFavorite = async (tmdbMovieId) => {
  const response = await api.post(`/movie-favorites/toggle-movie/${tmdbMovieId}`);
  return response.data;
};

/**
 * Agrega o elimina una serie de favoritos.
 */
export const toggleSeriesFavorite = async (tmdbSeriesId) => {
  const response = await api.post(`/movie-favorites/toggle-series/${tmdbSeriesId}`);
  return response.data;
};

/**
 * Verifica si una película es favorita.
 */
export const isMovieFavorite = async (tmdbMovieId) => {
  const response = await api.get(`/movie-favorites/is-favorite-movie/${tmdbMovieId}`);
  return response.data.isFavorite;
};

/**
 * Verifica si una serie es favorita.
 */
export const isSeriesFavorite = async (tmdbSeriesId) => {
  const response = await api.get(`/movie-favorites/is-favorite-series/${tmdbSeriesId}`);
  return response.data.isFavorite;
};
