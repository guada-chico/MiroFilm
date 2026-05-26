import api from './api-config';

// ─────────────────────────────────────────────
//  GOOGLE BOOKS (todo en español)
// ─────────────────────────────────────────────

export const searchExternalBooks = async (query) => {
  const response = await api.get('/externalbooks/search', { params: { q: query } });
  return response.data;
};

export const getSpanishRecommendations = async (genre = 'novela') => {
  const response = await api.get('/externalbooks/recommendations', { params: { genre } });
  return response.data;
};

export const getSpanishClassics = async () => {
  const response = await api.get('/externalbooks/classics');
  return response.data;
};

// ─────────────────────────────────────────────
//  PENGUIN RANDOM HOUSE (cuando la key esté activa)
// ─────────────────────────────────────────────

/**
 * Novedades recientes de PRH en español.
 * Devuelve { activated: false } si la key aún no está aprobada.
 */
export const getPrhNewReleases = async (rows = 20) => {
  const response = await api.get('/prhbooks/new-releases', { params: { rows } });
  return response.data;
};

/**
 * Próximas publicaciones de PRH en español.
 */
export const getPrhComingSoon = async (rows = 20) => {
  const response = await api.get('/prhbooks/coming-soon', { params: { rows } });
  return response.data;
};

/**
 * Búsqueda en el catálogo de PRH.
 */
export const searchPrhBooks = async (query, rows = 20) => {
  const response = await api.get('/prhbooks/search', { params: { q: query, rows } });
  return response.data;
};

/**
 * Búsqueda en PRH por categoría BISAC.
 */
export const searchPrhByCategory = async (categoryUri, rows = 20) => {
  const response = await api.get(`/prhbooks/category/${categoryUri}`, { params: { rows } });
  return response.data;
};

/**
 * Comprueba si la key de PRH está activa.
 * @returns {{ activated: boolean, message: string }}
 */
export const checkPrhStatus = async () => {
  const response = await api.get('/prhbooks/status');
  return response.data;
};

// ─────────────────────────────────────────────
//  OPEN LIBRARY — portadas directas por ISBN
// ─────────────────────────────────────────────

export const getOpenLibraryCover = (isbn, size = 'M') => {
  if (!isbn) return null;
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
};

// ─────────────────────────────────────────────
//  GUTENDEX (clásicos gratuitos para leer)
// ─────────────────────────────────────────────

export const searchGutendexBooks = async (query) => {
  const response = await api.get('/gutendex/search', { params: { q: query } });
  return response.data;
};

export const getTopClassics = async (count = 20) => {
  const response = await api.get('/gutendex/top', { params: { count } });
  return response.data;
};

export const getClassicsByPage = async (page = 1) => {
  const response = await api.get('/gutendex/page', { params: { page } });
  return response.data;
};
