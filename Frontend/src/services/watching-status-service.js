import api from './api-config';

/**
 * Obtiene todos los estados de visualización del usuario autenticado.
 */
export async function getMyWatchingStatuses() {
  const response = await api.get('/WatchingStatus/me');
  return response.data;
}

/**
 * Obtiene el estado de una película por su tmdbId para el usuario autenticado.
 * Devuelve { status: string | null }
 */
export async function getMyMovieStatus(tmdbId) {
  try {
    const response = await api.get(`/WatchingStatus/me/movie/tmdb/${tmdbId}`);
    return response.data.status;
  } catch {
    return null;
  }
}

/**
 * Obtiene el estado de una serie por su tmdbId para el usuario autenticado.
 * Devuelve { status: string | null }
 */
export async function getMySeriesStatus(tmdbId) {
  try {
    const response = await api.get(`/WatchingStatus/me/series/tmdb/${tmdbId}`);
    return response.data.status;
  } catch {
    return null;
  }
}

/**
 * Establece o actualiza el estado de una película por tmdbId.
 * movieData debe contener los datos de la película (title, posterUrl, etc.) por si hay que crearla en BD.
 */
export async function setMovieStatus(tmdbId, status, movieData) {
  const response = await api.post(`/WatchingStatus/me/movie/tmdb/${tmdbId}`, {
    status,
    movieData,
  });
  return response.data;
}

/**
 * Establece o actualiza el estado de una serie por tmdbId.
 * seriesData debe contener los datos de la serie por si hay que crearla en BD.
 */
export async function setSeriesStatus(tmdbId, status, seriesData) {
  const response = await api.post(`/WatchingStatus/me/series/tmdb/${tmdbId}`, {
    status,
    seriesData,
  });
  return response.data;
}

/**
 * Elimina el estado de una película por tmdbId.
 */
export async function deleteMovieStatus(tmdbId) {
  await api.delete(`/WatchingStatus/me/movie/tmdb/${tmdbId}`);
}

/**
 * Elimina el estado de una serie por tmdbId.
 */
export async function deleteSeriesStatus(tmdbId) {
  await api.delete(`/WatchingStatus/me/series/tmdb/${tmdbId}`);
}

// ─── Endpoints legacy (user/{userId}) para compatibilidad ───────────────────

export async function getUserWatchingStatus(userId) {
  const response = await api.get(`/WatchingStatus/user/${userId}`);
  return response.data;
}

export async function updateMovieStatus(userId, movieId, newStatus) {
  const response = await api.post('/WatchingStatus', {
    userId,
    movieId,
    status: newStatus,
    currentMinute: 0,
  });
  return response.data;
}

export async function updateSeriesStatus(userId, seriesId, newStatus) {
  const response = await api.post('/WatchingStatus', {
    userId,
    seriesId,
    status: newStatus,
    currentMinute: 0,
  });
  return response.data;
}

export async function deleteWatchingStatus(statusId) {
  await api.delete(`/WatchingStatus/${statusId}`);
}
