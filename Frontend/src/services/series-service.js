import api from './api-config';

/**
 * Obtiene todas las series disponibles.
 */
export const getAllSeries = async () => {
  const response = await api.get('/series');
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
