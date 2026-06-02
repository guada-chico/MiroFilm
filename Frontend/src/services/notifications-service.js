import api from './api-config';

/**
 * Obtiene todas las notificaciones del usuario actual.
 */
export const getNotifications = async () => {
  const response = await api.get('/notification');
  return response.data;
};

/**
 * Marca una notificación como leída.
 */
export const markAsRead = async (id) => {
  const response = await api.put(`/notification/${id}/read`);
  return response.data;
};

/**
 * Elimina una notificación.
 */
export const deleteNotification = async (id) => {
  const response = await api.delete(`/notification/${id}`);
  return response.data;
};
