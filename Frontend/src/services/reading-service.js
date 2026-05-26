import api from './api-config';

/**
 * Actualiza el estado de lectura de un libro.
 * @param {number} bookId
 * @param {string} status - 'Reading', 'Completed', 'WantToRead'
 * @param {number} currentPage
 */
export const updateReadingStatus = async (bookId, status, currentPage) => {
  const response = await api.post('/reading/update-status', null, {
    params: { bookId, status, currentPage },
  });
  return response.data;
};

/**
 * Obtiene el libro que el usuario está leyendo actualmente.
 */
export const getCurrentReading = async () => {
  const response = await api.get('/reading/current');
  return response.data;
};

/**
 * Obtiene toda la biblioteca personal del usuario (todos los estados).
 */
export const getMyLibrary = async () => {
  const response = await api.get('/reading/my-library');
  return response.data;
};
