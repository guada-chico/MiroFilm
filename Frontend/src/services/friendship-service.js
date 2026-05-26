import api from './api-config';

/**
 * Envía una solicitud de amistad a otro usuario.
 */
export const sendFriendRequest = async (receiverId) => {
  const response = await api.post(`/friendship/request/${receiverId}`);
  return response.data;
};

/**
 * Responde a una solicitud de amistad.
 * @param {number} friendshipId
 * @param {string} status - 'Accepted' o 'Rejected'
 */
export const respondToRequest = async (friendshipId, status) => {
  const response = await api.put(`/friendship/respond/${friendshipId}`, null, {
    params: { status },
  });
  return response.data;
};

/**
 * Obtiene la lista de amigos aceptados del usuario actual.
 */
export const getMyFriends = async () => {
  const response = await api.get('/friendship/my-friends');
  return response.data;
};
