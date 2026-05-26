import api from './api-config';

/**
 * Obtiene todos los libros de la base de datos local.
 */
export const getAllBooks = async () => {
  const response = await api.get('/books');
  return response.data;
};

/**
 * Obtiene un libro por su ID.
 */
export const getBookById = async (id) => {
  const response = await api.get(`/books/${id}`);
  return response.data;
};

/**
 * Busca libros por texto (título, autor, etc.).
 */
export const searchBooks = async (query) => {
  const response = await api.get('/books/search', { params: { q: query } });
  return response.data;
};
