import api from './api-config';

/**
 * Obtiene las recomendaciones personalizadas del usuario actual.
 */
export const getMyRecommendations = async () => {
  const response = await api.get('/recommendations');
  return response.data;
};
