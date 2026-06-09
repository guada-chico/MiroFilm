import api from './api-config';

/**
 * Obtiene todos los favoritos de películas y series del usuario actual.
 */
export const getMyFavorites = async () => {
  const response = await api.get('/movie-favorites');
  return response.data;
};

/**
 * Agrega o elimina una película de favoritos.
 * Envía los datos de la película para que el backend la persista si aún no existe.
 */
export const toggleMovieFavorite = async (tmdbMovieId, movieData = null) => {
  const response = await api.post(
    `/movie-favorites/toggle-movie/${tmdbMovieId}`,
    movieData ?? {}
  );
  return response.data;
};

/**
 * Agrega o elimina una serie de favoritos.
 * Envía los datos de la serie para que el backend la persista si aún no existe.
 */
export const toggleSeriesFavorite = async (tmdbSeriesId, seriesData = null) => {
  const response = await api.post(
    `/movie-favorites/toggle-series/${tmdbSeriesId}`,
    seriesData ?? {}
  );
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
