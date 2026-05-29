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

/**
 * Obtiene las solicitudes de amistad pendientes recibidas.
 */
export const getPendingRequests = async () => {
  const response = await api.get('/friendship/pending-requests');
  return response.data;
};

/**
 * Obtiene las solicitudes de amistad pendientes enviadas.
 */
export const getSentRequests = async () => {
  const response = await api.get('/friendship/sent-requests');
  return response.data;
};

/**
 * Busca usuarios por nombre o email.
 */
export const searchUsers = async (query) => {
  const response = await api.get('/friendship/search', {
    params: { query },
  });
  return response.data;
};

/**
 * Obtiene información de un usuario específico.
 */
export const getUserById = async (userId) => {
  const response = await api.get(`/friendship/user/${userId}`);
  return response.data;
};

/**
 * Cancela una solicitud de amistad enviada.
 */
export const cancelRequest = async (friendshipId) => {
  const response = await api.delete(`/friendship/cancel-request/${friendshipId}`);
  return response.data;
};

/**
 * Obtiene el estado de amistad entre dos usuarios.
 */
export const getFriendshipStatus = async (otherUserId) => {
  const response = await api.get(`/friendship/status/${otherUserId}`);
  return response.data;
};

