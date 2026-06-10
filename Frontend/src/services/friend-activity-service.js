import api from './api-config';

/**
 * Obtiene la actividad reciente de los amigos.
 */
export const getFriendsActivity = async () => {
  const response = await api.get('/friend-activity/recent');
  return response.data;
};

/**
 * Obtiene los favoritos de un amigo específico.
 */
export const getFriendFavorites = async (friendId) => {
  const response = await api.get(`/friend-activity/friend-favorites/${friendId}`);
  return response.data;
};

/**
 * Obtiene lo que está viendo un amigo.
 */
export const getFriendWatching = async (friendId) => {
  const response = await api.get(`/friend-activity/friend-watching/${friendId}`);
  return response.data;
};

/**
 * Obtiene las películas/series que un amigo marcó como "Visto".
 */
export const getFriendWatched = async (friendId) => {
  const response = await api.get(`/friend-activity/friend-watched/${friendId}`);
  return response.data;
};
