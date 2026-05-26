import api from './api-config';

/**
 * Alterna el estado de favorito de un libro (añadir/quitar).
 * @returns {boolean} true si se añadió, false si se eliminó
 */
export const toggleFavorite = async (bookId) => {
  const response = await api.post(`/favorites/toggle/${bookId}`);
  return response.data.isFavorite;
};

/**
 * Obtiene todos los libros favoritos del usuario actual.
 */
export const getMyFavorites = async () => {
  const response = await api.get('/favorites');
  return response.data;
};
